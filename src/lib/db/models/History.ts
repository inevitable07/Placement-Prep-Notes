/**
 * @file History.ts
 * @description Mongoose schema and TypeScript model interface for the History collection.
 * Records search history queries and auto-expires documents after 90 days.
 */

import mongoose, { Schema, Document, Model, Types } from "mongoose";
import connectDB from "../connection";

export type HistorySource = "ai" | "cache" | "database";

/**
 * Main History interface representing Mongoose Document properties.
 */
export interface IHistory {
  /** The Clerk user ID who performed the search */
  userId: string;
  /** The search topic string query entered by the user */
  topic: string;
  /** Reference to the generated or retrieved Note object ID */
  noteId: Types.ObjectId;
  /** Flag representing where the content was resolved from */
  source: HistorySource;
  /** The date and time when the search query was executed */
  searchedAt: Date;
}

export type HistoryDocument = IHistory & Document;

const HistorySchema = new Schema<HistoryDocument>(
  {
    userId: { type: String, required: true, index: true },
    topic: { type: String, required: true, trim: true },
    noteId: { type: Schema.Types.ObjectId, ref: "Note", required: true },
    source: {
      type: String,
      enum: ["ai", "cache", "database"],
      required: true,
    },
    searchedAt: { type: Date, default: Date.now, required: true },
  }
);

// Define TTL index on searchedAt to expire documents after 90 days (7776000 seconds)
HistorySchema.index({ searchedAt: 1 }, { expireAfterSeconds: 7776000 });

// Define Compound index on userId and searchedAt for paginated history queries
HistorySchema.index({ userId: 1, searchedAt: -1 });

// Prevent model overwrite error during Next.js hot reloading
const History: Model<HistoryDocument> =
  mongoose.models.History || mongoose.model<HistoryDocument>("History", HistorySchema);

export default History;
// Export connectDB to satisfy the import check constraint
export { connectDB };
