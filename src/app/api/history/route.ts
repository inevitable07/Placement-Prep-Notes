/**
 * @file route.ts
 * @description API Route Handler for retrieving paginated user search history.
 * 
 * CONTRACT:
 * - METHOD: GET
 * - AUTH REQUIRED: Yes
 * - INPUT (URL Query Parameters):
 *   - limit: number (optional, coerced integer, default 20, max 50)
 *   - skip: number (optional, coerced integer, default 0)
 * - OUTPUT (JSON ApiResponse):
 *   - success: true
 *   - data: { items: IHistory[], total: number, limit: number, skip: number }
 *   - meta: { source: 'database', generationMs: 0, cached: false, requestId }
 * - ERRORS:
 *   - 400 (INVALID_INPUT): Bad parameter inputs.
 *   - 401 (UNAUTHORIZED): Session missing or invalid.
 *   - 500 (INTERNAL_SERVER_ERROR): Server issues.
 */

import { withAuth } from "@/lib/api/middleware";
import { HistoryQuerySchema } from "@/lib/api/schemas";
import { HistoryService } from "@/lib/services/HistoryService";
import { successResponse, errorResponse } from "@/lib/api/response";
import { AppError } from "@/lib/errors/AppError";

export async function GET(request: Request) {
  const requestId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : "req-" + Date.now().toString(36);

  try {
    // 1. Authorize lookup
    const { userId } = await withAuth(request);

    // 2. Parse and validate URL search parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const validationResult = HistoryQuerySchema.safeParse(queryParams);
    if (!validationResult.success) {
      const issue = validationResult.error.issues[0];
      const path = issue?.path.join(".") || "query";
      const errMsg = issue ? `[${path}]: ${issue.message}` : "Validation failed";
      throw new AppError(`Invalid search parameters: ${errMsg}`, "INVALID_INPUT", 400);
    }

    const { limit, skip } = validationResult.data;

    // 3. Delegate lookup to HistoryService
    const result = await HistoryService.getRecentHistory(userId, limit, skip);

    // 4. Return success envelope
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
          err instanceof Error ? err.message : "An unexpected error occurred during history fetch",
          "INTERNAL_SERVER_ERROR",
          500
        );

    return Response.json(errorResponse(error, requestId), { status: error.statusCode });
  }
}
