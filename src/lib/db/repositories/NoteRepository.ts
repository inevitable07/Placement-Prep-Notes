/**
 * @file NoteRepository.ts
 * @description Repository pattern wrapper for the Note model.
 * Handles AI-generated and cached note retrievals and upsert deduplications.
 */

import connectDB from "../connection";
import Note, { NoteDocument } from "../models/Note";
import { AppError } from "../../errors/AppError";

/**
 * Repository handler for Note database operations.
 */
export class NoteRepository {
  /**
   * Finds a note by its SHA256 content hash.
   * Used for deduplicating AI generations.
   * Uses lean read check for optimized performance.
   * 
   * @param {string} hash - SHA256 content hash.
   * @returns {Promise<NoteDocument | null>} The note or null if not found.
   * @throws {AppError} If a database exception occurs.
   */
  static async findByHash(hash: string): Promise<NoteDocument | null> {
    await connectDB();
    try {
      const note = await Note.findOne({ hash }).lean();
      return note as unknown as NoteDocument | null;
    } catch (err) {
      throw new AppError(
        `Database error finding note by hash: ${err instanceof Error ? err.message : String(err)}`,
        "DB_ERROR",
        500
      );
    }
  }

  /**
   * Finds a note by its MongoDB Object ID.
   * Uses lean read check for optimized performance.
   * 
   * @param {string} noteId - MongoDB Object ID.
   * @returns {Promise<NoteDocument | null>} The note or null if not found.
   * @throws {AppError} If a database exception occurs.
   */
  static async findById(noteId: string): Promise<NoteDocument | null> {
    await connectDB();
    try {
      const note = await Note.findById(noteId).lean();
      return note as unknown as NoteDocument | null;
    } catch (err) {
      throw new AppError(
        `Database error finding note by ID: ${err instanceof Error ? err.message : String(err)}`,
        "DB_ERROR",
        500
      );
    }
  }

  /**
   * Finds a note by its URL-friendly slug.
   * Uses lean read check for optimized performance.
   * 
   * @param {string} slug - Unique topic slug.
   * @returns {Promise<NoteDocument | null>} The note or null if not found.
   * @throws {AppError} If a database exception occurs.
   */
  static async findBySlug(slug: string): Promise<NoteDocument | null> {
    await connectDB();
    try {
      const note = await Note.findOne({ slug }).lean();
      return note as unknown as NoteDocument | null;
    } catch (err) {
      throw new AppError(
        `Database error finding note by slug: ${err instanceof Error ? err.message : String(err)}`,
        "DB_ERROR",
        500
      );
    }
  }

  /**
   * Creates a new note document.
   * 
   * @param {Partial<NoteDocument>} data - Note fields payload.
   * @returns {Promise<NoteDocument>} The created note document.
   * @throws {AppError} If a database exception occurs.
   */
  static async createNote(data: Partial<NoteDocument>): Promise<NoteDocument> {
    await connectDB();
    try {
      const note = await Note.create(data);
      return note;
    } catch (err) {
      throw new AppError(
        `Database error creating note: ${err instanceof Error ? err.message : String(err)}`,
        "DB_ERROR",
        500
      );
    }
  }

  /**
   * Upserts a note by its unique content hash and returns whether it was newly created.
   * 
   * @param {string} hash - SHA256 content hash.
   * @param {Partial<NoteDocument>} data - Note fields payload.
   * @returns {Promise<{ note: NoteDocument; isNew: boolean }>} The upserted note and isNew flag.
   * @throws {AppError} If a database exception occurs.
   */
  static async upsertByHash(
    hash: string,
    data: Partial<NoteDocument>
  ): Promise<{ note: NoteDocument; isNew: boolean }> {
    await connectDB();
    try {
      const existing = await Note.findOne({ hash });
      if (existing) {
        // Exists, perform update
        const updated = await Note.findOneAndUpdate({ hash }, data, {
          returnDocument: "after",
          runValidators: true,
        });
        if (!updated) {
          throw new Error("Update operation returned null");
        }
        return { note: updated, isNew: false };
      } else {
        // Does not exist, create new
        const created = await Note.create({ ...data, hash });
        return { note: created, isNew: true };
      }
    } catch (err) {
      throw new AppError(
        `Database error upserting note by hash: ${err instanceof Error ? err.message : String(err)}`,
        "DB_ERROR",
        500
      );
    }
  }

  /**
   * Increments the running note view count by 1.
   * 
   * @param {string} noteId - MongoDB Object ID.
   * @returns {Promise<void>}
   * @throws {AppError} If no note is found or a database exception occurs.
   */
  static async incrementViewCount(noteId: string): Promise<void> {
    await connectDB();
    try {
      const res = await Note.updateOne(
        { _id: noteId },
        { $inc: { viewCount: 1 } }
      );
      if (res.matchedCount === 0) {
        throw new Error(`No note found with ID: ${noteId}`);
      }
    } catch (err) {
      throw new AppError(
        `Database error incrementing view count: ${err instanceof Error ? err.message : String(err)}`,
        "DB_ERROR",
        500
      );
    }
  }

  /**
   * Retrieves the most recently created notes.
   * Uses lean read checks for optimized performance.
   * 
   * @param {number} [limit=10] - Maximum number of notes to fetch.
   * @returns {Promise<NoteDocument[]>} List of notes sorted by creation date descending.
   * @throws {AppError} If a database exception occurs.
   */
  static async findRecentNotes(limit: number = 10): Promise<NoteDocument[]> {
    await connectDB();
    try {
      const notes = await Note.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
      return notes as unknown as NoteDocument[];
    } catch (err) {
      throw new AppError(
        `Database error fetching recent notes: ${err instanceof Error ? err.message : String(err)}`,
        "DB_ERROR",
        500
      );
    }
  }
}
