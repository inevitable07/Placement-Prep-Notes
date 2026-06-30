/**
 * @file route.ts
 * @description API Route Handler for triggering AI placement notes generation.
 * 
 * CONTRACT:
 * - METHOD: POST
 * - AUTH REQUIRED: Yes (with Rate Limiting)
 * - INPUT (JSON Body):
 *   - topic: string (min 3, max 100 characters)
 *   - level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' (optional, default 'INTERMEDIATE')
 * - OUTPUT (JSON ApiResponse):
 *   - success: true
 *   - data: { noteId, note: INoteContent, isNew: boolean, preview: INotePreview }
 *   - meta: { source, generationMs, cached, requestId, cacheStatus }
 * - ERRORS:
 *   - 400 (INVALID_INPUT, INVALID_JSON): Bad request payloads.
 *   - 401 (UNAUTHORIZED): Session missing or invalid.
 *   - 500 (INTERNAL_SERVER_ERROR, DB_ERROR): Server issues.
 */

import { withAuthAndRateLimit } from "@/lib/api/middleware";
import { validateRequest } from "@/lib/api/validate";
import { GenerateNoteSchema } from "@/lib/api/schemas";
import { NoteService } from "@/lib/services/NoteService";
import { successResponse, errorResponse } from "@/lib/api/response";
import { AppError } from "@/lib/errors/AppError";

export async function POST(request: Request) {
  const startTime = Date.now();
  const requestId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : "req-" + Date.now().toString(36);

  try {
    // 1. Authorize & enforce rate limits
    const { userId } = await withAuthAndRateLimit(request);

    // 2. Validate request payload against contract
    const body = await validateRequest(request, GenerateNoteSchema);

    // 3. Delegate execution details to NoteService
    const result = await NoteService.generateNote(userId, body.topic, body.level);

    // 4. Calculate execution duration
    const generationMs = Date.now() - startTime;

    // 5. Structure success envelope
    const payload = successResponse(
      {
        noteId: result.noteId,
        note: result.note,
        isNew: result.isNew,
        preview: result.preview,
      },
      {
        source: result.source,
        generationMs,
        cached: result.source === "cache",
        requestId,
        cacheStatus: result.cacheStatus,
      }
    );

    return Response.json(payload, { status: 200 });
  } catch (err) {
    const error = err instanceof AppError 
      ? err 
      : new AppError(
          err instanceof Error ? err.message : "An unexpected error occurred during note generation",
          "INTERNAL_SERVER_ERROR",
          500
        );

    return Response.json(errorResponse(error, requestId), { status: error.statusCode });
  }
}
