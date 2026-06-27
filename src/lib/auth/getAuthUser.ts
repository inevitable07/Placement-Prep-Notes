/**
 * @file getAuthUser.ts
 * @description Canonical server-side authentication helpers for Clerk.
 * Provides functions to safely retrieve authenticated user session information.
 */

import { auth } from "@clerk/nextjs/server";
import { UserRepository } from "@/lib/db/repositories/UserRepository";
import { UserDocument } from "@/lib/db/models/User";

/**
 * Custom authentication error structure with a code property.
 */
export class AuthError extends Error {
  public code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "AuthError";
    this.code = code;
    // Set the prototype explicitly for standard error inheritance in TS
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

interface AuthenticatedUser {
  userId: string;
  sessionId: string;
}

/**
 * Retrieves the currently authenticated user's ID and Session ID.
 * Throws an AuthError if the user is not authenticated.
 * 
 * @returns {Promise<AuthenticatedUser>} The active session's userId and sessionId.
 * @throws {AuthError} If no authenticated user is found (code: 'UNAUTHORIZED').
 * 
 * @example
 * // In a protected Server Component or API Route:
 * const { userId } = await getAuthUser();
 */
export async function getAuthUser(): Promise<AuthenticatedUser> {
  const { userId, sessionId } = auth();

  if (!userId || !sessionId) {
    throw new AuthError("UNAUTHORIZED", "UNAUTHORIZED");
  }

  return { userId, sessionId };
}

/**
 * Retrieves the user's ID and Session ID if they are authenticated,
 * otherwise returns null. Does not throw.
 * 
 * @returns {Promise<AuthenticatedUser | null>} The active session details, or null if unauthenticated.
 * 
 * @example
 * // In a hybrid or optional-auth route:
 * const user = await getOptionalAuthUser();
 * if (user) {
 *   // render personalized content
 * } else {
 *   // render guest content
 * }
 */
export async function getOptionalAuthUser(): Promise<AuthenticatedUser | null> {
  const { userId, sessionId } = auth();

  if (!userId || !sessionId) {
    return null;
  }

  return { userId, sessionId };
}

/**
 * Retrieves the database user associated with the given Clerk ID,
 * or creates it if it does not exist (upsert). This ensures that
 * when a user first hits a dashboard, they have a fully synced document
 * in MongoDB even if the webhook transaction has not finished processing.
 * 
 * @param {string} clerkId - The Clerk user identifier.
 * @param {string} email - The user's primary email address.
 * @returns {Promise<UserDocument>} The upserted MongoDB user document.
 * @throws {AppError} If a database exception occurs.
 * 
 * @example
 * // In a Server Component (e.g., Dashboard page):
 * const dbUser = await getOrCreateDbUser(userId, emailAddress);
 */
export async function getOrCreateDbUser(clerkId: string, email: string): Promise<UserDocument> {
  return UserRepository.upsertFromWebhook(clerkId, email);
}
