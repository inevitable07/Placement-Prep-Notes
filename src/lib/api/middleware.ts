/**
 * @file middleware.ts
 * @description API route helper middleware controllers for authentication and rate-limiting.
 */

import { getAuthUser } from "@/lib/auth/getAuthUser";
import { checkRateLimit } from "./rateLimit";
import { AppError } from "@/lib/errors/AppError";

/**
 * Checks request session context for authenticated user credentials.
 * 
 * @param {Request} request - Standard incoming HTTP Request object.
 * @returns {Promise<{ userId: string }>} Auth properties on success.
 * @throws {AppError} UNAUTHORIZED (401) if authentication checks fail.
 */
export async function withAuth(request: Request): Promise<{ userId: string }> {
  console.log("[Auth] Checking credentials for request to:", request.url);
  try {
    const { userId } = await getAuthUser();
    return { userId };
  } catch {
    throw new AppError("Authentication required", "UNAUTHORIZED", 401);
  }
}

/**
 * Validates auth credentials and checks request volume velocity rate limits.
 * 
 * @param {Request} request - Standard incoming HTTP Request object.
 * @returns {Promise<{ userId: string }>} Auth details.
 * @throws {AppError} UNAUTHORIZED (401) or RATE_LIMIT_EXCEEDED (429) if checks fail.
 */
export async function withAuthAndRateLimit(request: Request): Promise<{ userId: string }> {
  const { userId } = await withAuth(request);
  await checkRateLimit(userId);
  return { userId };
}
