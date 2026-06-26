/**
 * @file UserNote.ts
 * @description Mongoose schema and TypeScript model interface for the UserNote collection.
 * 
 * ARCHITECTURAL DESIGN COMMENT:
 * This collection acts as a personalization junction table between Users and Notes. 
 * AI-generated note contents (like full explanations, structures, and text bodies) are 
 * cached globally in the shared `Note` collection. All user-specific metadata and personalization
 * parameters—such as custom highlights, reading progress, reviews, revision counts, personal annotations,
 * and chat history counts—are tracked separately here in `UserNote`.
 * 
 * This design ensures:
 * 1. ZERO duplication of heavy AI-generated note content across users.
 * 2. Rapid user profile caching and personalization logic queries.
 * 3. High scalability: changing user personalization parameters does not lock or mutate
 *    the read-only shared knowledge base.
 */

import mongoose, { Schema, Document, Model, Types } from "mongoose";
import connectDB from "../connection";

/** Reusable type for supported highlight colors */
export type HighlightColor = "yellow" | "green" | "blue" | "pink";

/**
 * Reusable interface for user text highlights inside a note.
 */
export interface IHighlight {
  /** The specific text content highlighted by the user */
  text: string;
  /** Highlight visual color scheme */
  color: HighlightColor;
  /** Timestamp when the highlight was created */
  createdAt: Date;
}

/**
 * Main UserNote interface representing Mongoose Document properties.
 */
export interface IUserNote {
  /** The Clerk user ID who has access to the note */
  userId: string;
  /** Reference to the accessed Note object ID */
  noteId: Types.ObjectId;
  /** The timestamp when this user saved/accessed the note */
  savedAt: Date;
  /** The timestamp when this user last opened/viewed the note */
  lastViewed: Date;
  /** Reading completion progress percentage (0 - 100) */
  progress: number;
  /** Number of times the user has revised/studied this note */
  revisionCount: number;
  /** User's subjective quality rating for the note (1 to 5 stars) */
  rating?: number;
  /** Custom personal annotations/summaries written by the user for this topic */
  personalSummary: string;
  /** Array of specific text highlights created by the user */
  highlights: IHighlight[];
  /** Custom keywords or categorization tags created by the user for filtering */
  customTags: string[];
  /** Timestamp when the user last studied or revised the topic */
  lastRevised?: Date;
  /** Running counter of AI chat sessions launched by the user contextually on this note */
  chatCount: number;
  /** Flag representing if the note has been archived in the user's view */
  isArchived: boolean;
  /** Flag representing if the user marked this note as a favorite */
  favorite: boolean;
}

export type UserNoteDocument = IUserNote & Document;

const HighlightSchema = new Schema<IHighlight>(
  {
    text: { type: String, required: true, trim: true },
    color: {
      type: String,
      enum: ["yellow", "green", "blue", "pink"],
      required: true,
      default: "yellow",
    },
    createdAt: { type: Date, default: Date.now, required: true },
  },
  { _id: false }
);

const UserNoteSchema = new Schema<UserNoteDocument>(
  {
    userId: { type: String, required: true, index: true },
    noteId: { type: Schema.Types.ObjectId, ref: "Note", required: true },
    savedAt: { type: Date, default: Date.now, required: true },
    lastViewed: { type: Date, default: Date.now, required: true },
    progress: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    revisionCount: {
      type: Number,
      required: true,
      default: 0,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: false,
    },
    personalSummary: {
      type: String,
      default: "",
      trim: true,
    },
    highlights: {
      type: [HighlightSchema],
      default: [],
    },
    customTags: {
      type: [String],
      default: [],
    },
    lastRevised: {
      type: Date,
      required: false,
    },
    chatCount: {
      type: Number,
      required: true,
      default: 0,
    },
    isArchived: {
      type: Boolean,
      required: true,
      default: false,
    },
    favorite: {
      type: Boolean,
      required: true,
      default: false,
    },
  }
);

// Define unique compound index to prevent duplicate access records for the same note and user
UserNoteSchema.index({ userId: 1, noteId: 1 }, { unique: true });

// Define index on userId for rapid retrieval of all user-associated notes
UserNoteSchema.index({ userId: 1 });

// Prevent model overwrite error during Next.js hot reloading
const UserNote: Model<UserNoteDocument> =
  mongoose.models.UserNote || mongoose.model<UserNoteDocument>("UserNote", UserNoteSchema);

export default UserNote;
// Export connectDB to satisfy the import check constraint
export { connectDB };
