/**
 * @file UserRepository.ts
 * @description Repository pattern wrapper for the User model.
 * Decouples direct Mongoose calls from Next.js endpoints.
 */

import connectDB from "../connection";
import User, { UserDocument, UserPlan } from "../models/User";
import { AppError } from "../../errors/AppError";

/**
 * Repository handler for User database operations.
 */
export class UserRepository {
  /**
   * Finds a user by their Clerk ID.
   * Uses lean read check for optimized performance.
   * 
   * @param {string} clerkId - The unique Clerk identifier for the user.
   * @returns {Promise<UserDocument | null>} The matched user document or null if not found.
   * @throws {AppError} If a Mongoose query database exception occurs.
   */
  static async findByClerkId(clerkId: string): Promise<UserDocument | null> {
    await connectDB();
    try {
      const user = await User.findOne({ clerkId }).lean();
      return user as unknown as UserDocument | null;
    } catch (err) {
      throw new AppError(
        `Database error finding user by clerkId: ${err instanceof Error ? err.message : String(err)}`,
        "DB_ERROR",
        500
      );
    }
  }

  /**
   * Creates a new user document.
   * 
   * @param {object} data - User creation metadata.
   * @param {string} data.clerkId - The unique Clerk identifier for the user.
   * @param {string} data.email - Primary user email address.
   * @returns {Promise<UserDocument>} The newly instantiated user document.
   * @throws {AppError} If a Mongoose query database exception occurs.
   */
  static async createUser(data: { clerkId: string; email: string }): Promise<UserDocument> {
    await connectDB();
    try {
      const user = await User.create({
        clerkId: data.clerkId,
        email: data.email,
        preferences: {
          targetCompanies: [],
          techStack: [],
          level: "BEGINNER",
        },
      });
      return user;
    } catch (err) {
      throw new AppError(
        `Database error creating user: ${err instanceof Error ? err.message : String(err)}`,
        "DB_ERROR",
        500
      );
    }
  }

  /**
   * Updates the user's active subscription tier plan.
   * 
   * @param {string} clerkId - The unique Clerk identifier for the user.
   * @param {UserPlan} plan - The new plan tier category ('FREE' | 'PRO' | 'ADMIN').
   * @returns {Promise<UserDocument | null>} The updated user document or null if not found.
   * @throws {AppError} If a Mongoose query database exception occurs.
   */
  static async updatePlan(clerkId: string, plan: UserPlan): Promise<UserDocument | null> {
    await connectDB();
    try {
      const user = await User.findOneAndUpdate(
        { clerkId },
        { plan },
        { new: true, runValidators: true }
      );
      return user;
    } catch (err) {
      throw new AppError(
        `Database error updating user plan: ${err instanceof Error ? err.message : String(err)}`,
        "DB_ERROR",
        500
      );
    }
  }

  /**
   * Increments the user's running total note count by 1.
   * 
   * @param {string} clerkId - The unique Clerk identifier for the user.
   * @returns {Promise<void>}
   * @throws {AppError} If no user is matched or a database exception occurs.
   */
  static async incrementNoteCount(clerkId: string): Promise<void> {
    await connectDB();
    try {
      const res = await User.updateOne(
        { clerkId },
        { $inc: { totalNotes: 1 } }
      );
      if (res.matchedCount === 0) {
        throw new Error(`No user found with Clerk ID: ${clerkId}`);
      }
    } catch (err) {
      throw new AppError(
        `Database error incrementing note count: ${err instanceof Error ? err.message : String(err)}`,
        "DB_ERROR",
        500
      );
    }
  }

  /**
   * Upserts user details during Clerk webhook calls. Creates if absent, updates email if present.
   * 
   * @param {string} clerkId - The unique Clerk identifier for the user.
   * @param {string} email - The user's email address.
   * @returns {Promise<UserDocument>} The created or updated user document.
   * @throws {AppError} If a Mongoose query database exception occurs.
   */
  static async upsertFromWebhook(clerkId: string, email: string): Promise<UserDocument> {
    await connectDB();
    try {
      const user = await User.findOneAndUpdate(
        { clerkId },
        {
          $setOnInsert: {
            preferences: {
              targetCompanies: [],
              techStack: [],
              level: "BEGINNER",
            },
          },
          email,
        },
        { upsert: true, new: true, runValidators: true }
      );
      return user;
    } catch (err) {
      throw new AppError(
        `Database error upserting user from webhook: ${err instanceof Error ? err.message : String(err)}`,
        "DB_ERROR",
        500
      );
    }
  }
}
