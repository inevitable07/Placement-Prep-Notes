/**
 * @file route.ts
 * @description API Route Handler for fetching a generated note by its MongoDB ID.
 * 
 * CONTRACT:
 * - METHOD: GET
 * - AUTH REQUIRED: Yes
 * - INPUT (URL Parameter):
 *   - id: string (24-character hexadecimal MongoDB ObjectId)
 * - OUTPUT (JSON ApiResponse):
 *   - success: true
 *   - data: { id, topic, slug, domain, difficulty, content, status, viewCount, createdAt }
 *   - meta: { source: 'database', generationMs: 0, cached: false, requestId }
 * - ERRORS:
 *   - 400 (INVALID_INPUT): Invalid note ID format.
 *   - 401 (UNAUTHORIZED): Session missing or invalid.
 *   - 404 (NOT_FOUND): Note does not exist.
 *   - 500 (INTERNAL_SERVER_ERROR): Server issues.
 */

import { withAuth } from "@/lib/api/middleware";
import { NoteService } from "@/lib/services/NoteService";
import { successResponse, errorResponse } from "@/lib/api/response";
import { AppError } from "@/lib/errors/AppError";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const requestId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : "req-" + Date.now().toString(36);

  try {
    // 1. Authorize lookup
    await withAuth(request);

    // 2. Fetch parameter id
    const { id } = params;

    // 3. Delegate lookup to NoteService (validates format internally)
    const note = await NoteService.getNoteById(id);

    // 4. Map MongoDB document to a clean client-safe payload shape
    const safeNotePayload = {
      id: note._id.toString(),
      topic: note.topic,
      slug: note.slug,
      domain: note.domain,
      difficulty: note.difficulty,
      content: note.content,
      status: note.status,
      viewCount: note.viewCount,
      createdAt: note.createdAt,
    };

    return Response.json(
      successResponse(safeNotePayload, {
        source: "database",
        requestId,
      }),
      { status: 200 }
    );
  } catch (err) {
    const error = err instanceof AppError 
      ? err 
      : new AppError(
          err instanceof Error ? err.message : "An unexpected error occurred during note retrieval",
          "INTERNAL_SERVER_ERROR",
          500
        );

    return Response.json(errorResponse(error, requestId), { status: error.statusCode });
  }
}
