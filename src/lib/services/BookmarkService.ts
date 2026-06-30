/**
 * @file BookmarkService.ts
 * @description Bookmark business service layer. Handles bookmark updates and validation.
 */

import { NoteRepository } from "@/lib/db/repositories/NoteRepository";
import { BookmarkRepository } from "@/lib/db/repositories/BookmarkRepository";
import { AppError } from "@/lib/errors/AppError";

export class BookmarkService {
  /**
   * Toggles the bookmark status of a specific note for a user.
   * Ensures idempotence during adds/removes.
   * 
   * @param {string} userId - Auth session user ID.
   * @param {string} noteId - Target Note ObjectId.
   * @param {string} action - Action constraint ('add' | 'remove').
   * @param {string} [folder="General"] - Optional category folder grouping.
   * @returns {Promise<{ bookmarked: boolean; noteId: string }>} Resulting bookmark state.
   */
  static async toggleBookmark(
    userId: string,
    noteId: string,
    action: "add" | "remove",
    folder: string = "General"
  ): Promise<{ bookmarked: boolean; noteId: string }> {
    // Verify note exists in database before modifying bookmarks
    const note = await NoteRepository.findById(noteId);
    if (!note) {
      throw new AppError("Note not found", "NOT_FOUND", 404);
    }

    if (action === "add") {
      const alreadyBookmarked = await BookmarkRepository.isBookmarked(userId, noteId);
      if (!alreadyBookmarked) {
        await BookmarkRepository.addBookmark(userId, noteId, folder);
      }
    } else {
      try {
        await BookmarkRepository.removeBookmark(userId, noteId);
      } catch (err) {
        // Handle gracefully if bookmark is already deleted (idempotent remove)
        if (err instanceof AppError && err.message.includes("No bookmark found")) {
          console.log(`[BookmarkService] Bookmark already removed for note ${noteId}`);
        } else {
          throw err;
        }
      }
    }

    return {
      bookmarked: action === "add",
      noteId,
    };
  }
}
