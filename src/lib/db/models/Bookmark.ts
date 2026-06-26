/**
 * @file Bookmark.ts
 * @description Mongoose schema and TypeScript model interface for the Bookmark collection.
 * Tracks user bookmarked notes categorized in folders.
 */

import mongoose, { Schema, Document, Model, Types } from "mongoose";
import connectDB from "../connection";

/**
 * Main Bookmark interface representing Mongoose Document properties.
 */
export interface IBookmark {
  /** The Clerk user ID who bookmarked the note */
  userId: string;
  /** Reference to the bookmarked Note object ID */
  noteId: Types.ObjectId;
  /** The folder name category where the bookmark resides */
  folder: string;
  /** Automatically generated creation date */
  createdAt: Date;
  /** Automatically generated modification date */
  updatedAt: Date;
}

export type BookmarkDocument = IBookmark & Document;

const BookmarkSchema = new Schema<BookmarkDocument>(
  {
    userId: { type: String, required: true, index: true },
    noteId: { type: Schema.Types.ObjectId, ref: "Note", required: true },
    folder: { type: String, default: "General", required: true, trim: true },
  },
  {
    timestamps: true,
  }
);

// Define unique compound index to prevent duplicate bookmarks for the same note and user
BookmarkSchema.index({ userId: 1, noteId: 1 }, { unique: true });

// Prevent model overwrite error during Next.js hot reloading
const Bookmark: Model<BookmarkDocument> =
  mongoose.models.Bookmark || mongoose.model<BookmarkDocument>("Bookmark", BookmarkSchema);

export default Bookmark;
// Export connectDB to satisfy the import check constraint
export { connectDB };
