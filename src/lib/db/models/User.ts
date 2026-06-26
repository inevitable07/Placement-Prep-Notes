/**
 * @file User.ts
 * @description Mongoose schema and TypeScript model interface for the User collection.
 */

import mongoose, { Schema, Document, Model } from "mongoose";
import connectDB from "../connection";

export type UserPlan = "FREE" | "PRO" | "ADMIN";
export type UserLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

/**
 * User Preferences sub-document structure.
 */
export interface IUserPreferences {
  /** Target companies the user is preparing for (e.g. ['Google', 'Meta']) */
  targetCompanies: string[];
  /** Technical stack details (e.g. ['TypeScript', 'Node.js', 'React']) */
  techStack: string[];
  /** User skill level baseline */
  level: UserLevel;
}

/**
 * Main User interface representing Mongoose Document properties.
 */
export interface IUser {
  /** The unique clerk user ID */
  clerkId: string;
  /** User's primary email address */
  email: string;
  /** Active user plan level */
  plan: UserPlan;
  /** Total number of notes generated or cached by the user */
  totalNotes: number;
  /** User's consecutive active day streak count */
  streak: number;
  /** Last recorded active timestamp */
  lastActive: Date;
  /** User customization preferences and skills mapping */
  preferences: IUserPreferences;
  /** Automatically generated creation date */
  createdAt: Date;
  /** Automatically generated modification date */
  updatedAt: Date;
}

export type UserDocument = IUser & Document;

const UserPreferencesSchema = new Schema<IUserPreferences>(
  {
    targetCompanies: { type: [String], default: [] },
    techStack: { type: [String], default: [] },
    level: {
      type: String,
      enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
      required: true,
      default: "BEGINNER",
    },
  },
  { _id: false }
);

const UserSchema = new Schema<UserDocument>(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ["FREE", "PRO", "ADMIN"],
      default: "FREE",
      required: true,
    },
    totalNotes: { type: Number, default: 0, required: true },
    streak: { type: Number, default: 0, required: true },
    lastActive: { type: Date, default: Date.now, required: true },
    preferences: {
      type: UserPreferencesSchema,
      required: true,
      default: () => ({
        targetCompanies: [],
        techStack: [],
        level: "BEGINNER",
      }),
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model overwrite error during Next.js hot reloading
const User: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>("User", UserSchema);

export default User;
// Export connectDB to satisfy the import check constraint
export { connectDB };
