/**
 * @file Note.ts
 * @description Mongoose schema and TypeScript model interface for the Note collection.
 */

import mongoose, { Schema, Document, Model } from "mongoose";
import connectDB from "../connection";

export type NoteStatus = "generating" | "complete" | "failed";
export type NoteDomain =
  | "DSA"
  | "OS"
  | "Networks"
  | "Database"
  | "SystemDesign"
  | "WebDev"
  | "DevOps";
export type NoteDifficulty = "Beginner" | "Intermediate" | "Advanced";
export type NoteSource = "ai" | "cache" | "database";

/**
 * Main Note interface representing Mongoose Document properties.
 */
export interface INote {
  /** The clean, user-friendly topic of the note */
  topic: string;
  /** Unique URL-friendly slug representing the topic */
  slug: string;
  /** Unique SHA256 hash of the normalized topic to identify duplicate generations */
  hash: string;
  /** The complete generated content payload matching NoteSchema JSON */
  content: mongoose.Schema.Types.Mixed;
  /** Active status of the generation job */
  status: NoteStatus;
  /** Topic subject domain category */
  domain: NoteDomain;
  /** Topic target difficulty mapping */
  difficulty: NoteDifficulty;
  /** Running counter of total times this note has been viewed */
  viewCount: number;
  /** Flag representing where the content was resolved from */
  source: NoteSource;
  /** Time taken in milliseconds to generate the content via the AI engine */
  generationMs: number;
  /** Automatically generated creation date */
  createdAt: Date;
  /** Automatically generated modification date */
  updatedAt: Date;
}

export type NoteDocument = INote & Document;

const NoteSchema = new Schema<NoteDocument>(
  {
    topic: { type: String, required: true, minlength: 2, maxlength: 100, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    hash: { type: String, required: true, unique: true, trim: true, index: true },
    content: { type: Schema.Types.Mixed, required: true },
    status: {
      type: String,
      enum: ["generating", "complete", "failed"],
      default: "generating",
      required: true,
    },
    domain: {
      type: String,
      enum: ["DSA", "OS", "Networks", "Database", "SystemDesign", "WebDev", "DevOps"],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
    },
    viewCount: { type: Number, default: 0, required: true },
    source: {
      type: String,
      enum: ["ai", "cache", "database"],
      default: "ai",
      required: true,
    },
    generationMs: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Define Text index for full-text search on topic
NoteSchema.index({ topic: "text" });

// Define Compound index on domain and status
NoteSchema.index({ domain: 1, status: 1 });

// Prevent model overwrite error during Next.js hot reloading
const Note: Model<NoteDocument> =
  mongoose.models.Note || mongoose.model<NoteDocument>("Note", NoteSchema);

export default Note;
// Export connectDB to satisfy the import check constraint
export { connectDB };
