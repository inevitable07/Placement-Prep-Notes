/**
 * @file HistoryService.ts
 * @description History business service layer. Retrieves paginated search logs.
 */

import { HistoryRepository } from "@/lib/db/repositories/HistoryRepository";
import { HistoryDocument } from "@/lib/db/models/History";

export class HistoryService {
  /**
   * Retrieves paginated search query logs and running totals for a user.
   * 
   * @param {string} userId - Auth session user ID.
   * @param {number} limit - Maximum number of entries.
   * @param {number} skip - Number of entries to skip.
   * @returns {Promise<{ items: HistoryDocument[]; total: number; limit: number; skip: number }>} Packaged log list.
   */
  static async getRecentHistory(
    userId: string,
    limit: number,
    skip: number
  ): Promise<{ items: HistoryDocument[]; total: number; limit: number; skip: number }> {
    const items = await HistoryRepository.getRecentHistory(userId, limit, skip);
    const total = await HistoryRepository.getHistoryCount(userId);

    return {
      items,
      total,
      limit,
      skip,
    };
  }
}
