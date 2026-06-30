/**
 * @file route.ts
 * @description API Route Handler for adding or removing saved note bookmarks.
 * 
 * CONTRACT:
 * - METHOD: POST
 * - AUTH REQUIRED: Yes (with Rate Limiting)
 * - INPUT (JSON Body):
 *   - noteId: string (non-empty MongoDB ObjectId string)
 *   - action: 'add' | 'remove'
 *   - folder: string (optional, default 'General', max 50 characters)
 * - OUTPUT (JSON ApiResponse):
 *   - success: true
 *   - data: { bookmarked: boolean, noteId: string }
 *   - meta: { source: 'database', generationMs: 0, cached: false, requestId }
 * - ERRORS:
 *   - 400 (INVALID_INPUT, INVALID_JSON): Bad request payloads.
 *   - 401 (UNAUTHORIZED): Session missing or invalid.
 *   - 404 (NOT_FOUND): Target note not found.
 *   - 500 (INTERNAL_SERVER_ERROR): Server issues.
 */

import { withAuthAndRateLimit } from "@/lib/api/middleware";
import { validateRequest } from "@/lib/api/validate";
import { BookmarkSchema } from "@/lib/api/schemas";
import { BookmarkService } from "@/lib/services/BookmarkService";
import { successResponse, errorResponse } from "@/lib/api/response";
import { AppError } from "@/lib/errors/AppError";

export async function POST(request: Request) {
  const requestId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : "req-" + Date.now().toString(36);

  try {
    // 1. Authorize & check rate limit checks
    const { userId } = await withAuthAndRateLimit(request);

    // 2. Validate request properties
    const { noteId, action, folder } = await validateRequest(request, BookmarkSchema);

    // 3. Delegate bookmark update toggle to BookmarkService
    const result = await BookmarkService.toggleBookmark(userId, noteId, action, folder);

    // 4. Return success response
    return Response.json(
      successResponse(result, {
        source: "database",
        requestId,
      }),
      { status: 200 }
    );
  } catch (err) {
    const error = err instanceof AppError 
      ? err 
      : new AppError(
          err instanceof Error ? err.message : "An unexpected error occurred during bookmark processing",
          "INTERNAL_SERVER_ERROR",
          500
        );

    return Response.json(errorResponse(error, requestId), { status: error.statusCode });
  }
}
