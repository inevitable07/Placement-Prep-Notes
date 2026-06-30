/**
 * @file HistoryRepository.ts
 * @description Repository pattern wrapper for the History model.
 * Handles search log logging, paginated query checks, and counting.
 */

import connectDB from "../connection";
import History, { HistoryDocument, HistorySource } from "../models/History";
import { AppError } from "../../errors/AppError";

/**
 * Repository handler for History database operations.
 */
export class HistoryRepository {
  /**
   * Logs a new search history query entry.
   * 
   * @param {object} data - Search query metadata.
   * @param {string} data.userId - The Clerk user ID.
   * @param {string} data.topic - The searched topic text.
   * @param {string} data.noteId - Target Note Object ID reference.
   * @param {HistorySource} data.source - Note resolution source tier.
   * @returns {Promise<HistoryDocument>} The saved history document.
   * @throws {AppError} If a database exception occurs.
   */
  static async addEntry(data: {
    userId: string;
    topic: string;
    noteId: string;
    source: HistorySource;
  }): Promise<HistoryDocument> {
    await connectDB();
    try {
      const entry = await History.create(data);
      return entry;
    } catch (err) {
      throw new AppError(
        `Database error creating history entry: ${err instanceof Error ? err.message : String(err)}`,
        "DB_ERROR",
        500
      );
    }
  }

  /**
   * Retrieves paginated search queries for a user.
   * Uses lean read checks for optimized performance.
   * 
   * @param {string} userId - The Clerk user ID.
   * @param {number} [limit=20] - Maximum count of history logs.
   * @param {number} [skip=0] - Number of logs to skip.
   * @returns {Promise<HistoryDocument[]>} List of history items sorted by studied timestamp descending.
   * @throws {AppError} If a database exception occurs.
   */
  static async getRecentHistory(
    userId: string,
    limit: number = 20,
    skip: number = 0
  ): Promise<HistoryDocument[]> {
    await connectDB();
    try {
      const logs = await History.find({ userId })
        .sort({ searchedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("noteId")
        .lean();
      return logs as unknown as HistoryDocument[];
    } catch (err) {
      throw new AppError(
        `Database error fetching recent history: ${err instanceof Error ? err.message : String(err)}`,
        "DB_ERROR",
        500
      );
    }
  }

  /**
   * Counts the total history query logs recorded by a user.
   * 
   * @param {string} userId - The Clerk user ID.
   * @returns {Promise<number>} Total count of logs.
   * @throws {AppError} If a database exception occurs.
   */
  static async getHistoryCount(userId: string): Promise<number> {
    await connectDB();
    try {
      const count = await History.countDocuments({ userId });
      return count;
    } catch (err) {
      throw new AppError(
        `Database error counting history: ${err instanceof Error ? err.message : String(err)}`,
        "DB_ERROR",
        500
      );
    }
  }
}
