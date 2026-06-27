/**
 * @file BookmarkRepository.ts
 * @description Repository pattern wrapper for the Bookmark model.
 * Handles note bookmarking, deletions, checks, and listings.
 */

import connectDB from "../connection";
import Bookmark, { BookmarkDocument } from "../models/Bookmark";
import { AppError } from "../../errors/AppError";

/**
 * Repository handler for Bookmark database operations.
 */
export class BookmarkRepository {
  /**
   * Bookmarks a note inside a folder.
   * 
   * @param {string} userId - The Clerk user ID.
   * @param {string} noteId - Target Note Object ID reference.
   * @param {string} [folder="General"] - Target bookmark folder container.
   * @returns {Promise<BookmarkDocument>} The saved bookmark document.
   * @throws {AppError} If a database exception occurs.
   */
  static async addBookmark(
    userId: string,
    noteId: string,
    folder: string = "General"
  ): Promise<BookmarkDocument> {
    await connectDB();
    try {
      const bookmark = await Bookmark.create({ userId, noteId, folder });
      return bookmark;
    } catch (err) {
      throw new AppError(
        `Database error adding bookmark: ${err instanceof Error ? err.message : String(err)}`,
        "DB_ERROR",
        500
      );
    }
  }

  /**
   * Deletes a bookmark for a note.
   * 
   * @param {string} userId - The Clerk user ID.
   * @param {string} noteId - Target Note Object ID reference.
   * @returns {Promise<void>}
   * @throws {AppError} If no bookmark is found or a database exception occurs.
   */
  static async removeBookmark(userId: string, noteId: string): Promise<void> {
    await connectDB();
    try {
      const res = await Bookmark.deleteOne({ userId, noteId });
      if (res.deletedCount === 0) {
        throw new Error(`No bookmark found for user ${userId} and note ID ${noteId}`);
      }
    } catch (err) {
      throw new AppError(
        `Database error removing bookmark: ${err instanceof Error ? err.message : String(err)}`,
        "DB_ERROR",
        500
      );
    }
  }

  /**
   * Verifies if a user has bookmarked a specific note.
   * Uses lean read checks for optimized performance.
   * 
   * @param {string} userId - The Clerk user ID.
   * @param {string} noteId - Target Note Object ID reference.
   * @returns {Promise<boolean>} True if bookmark is present, false otherwise.
   * @throws {AppError} If a database exception occurs.
   */
  static async isBookmarked(userId: string, noteId: string): Promise<boolean> {
    await connectDB();
    try {
      const count = await Bookmark.countDocuments({ userId, noteId });
      return count > 0;
    } catch (err) {
      throw new AppError(
        `Database error checking bookmark status: ${err instanceof Error ? err.message : String(err)}`,
        "DB_ERROR",
        500
      );
    }
  }

  /**
   * Fetches all bookmarks owned by a user.
   * Uses lean read checks for optimized performance.
   * 
   * @param {string} userId - The Clerk user ID.
   * @returns {Promise<BookmarkDocument[]>} Array of bookmark items.
   * @throws {AppError} If a database exception occurs.
   */
  static async getUserBookmarks(userId: string): Promise<BookmarkDocument[]> {
    await connectDB();
    try {
      const bookmarks = await Bookmark.find({ userId })
        .sort({ createdAt: -1 })
        .lean();
      return bookmarks as unknown as BookmarkDocument[];
    } catch (err) {
      throw new AppError(
        `Database error fetching user bookmarks: ${err instanceof Error ? err.message : String(err)}`,
        "DB_ERROR",
        500
      );
    }
  }
}
