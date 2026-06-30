/**
 * @file response.ts
 * @description Standard API response envelope and meta formatting utilities.
 */

import { AppError } from "@/lib/errors/AppError";

export type ApiMeta = {
  source: "cache" | "database" | "ai";
  generationMs: number;
  cached: boolean;
  requestId: string;
  cacheStatus?: "HIT" | "MISS";
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown; // Only included in development
  };
  meta: ApiMeta;
};

/**
 * Returns a standardized success API response envelope.
 * 
 * @param {T} data - Payload data object.
 * @param {Partial<ApiMeta>} [meta] - Optional partial meta attributes.
 * @returns {ApiResponse<T>} Envelope package.
 */
export function successResponse<T>(data: T, meta?: Partial<ApiMeta>): ApiResponse<T> {
  const defaultRequestId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" 
    ? crypto.randomUUID() 
    : "req-" + Date.now().toString(36);

  const defaultMeta: ApiMeta = {
    source: "database",
    generationMs: 0,
    cached: false,
    requestId: defaultRequestId,
  };

  return {
    success: true,
    data,
    meta: {
      ...defaultMeta,
      ...meta,
    },
  };
}

/**
 * Returns a standardized error API response envelope.
 * Excludes detailed stack/error specs in production environment.
 * 
 * @param {AppError | Error} error - Exception thrown in processing.
 * @param {string} [requestId] - Running request tracking identifier.
 * @returns {ApiResponse<never>} Empty data envelope containing errors.
 */
export function errorResponse(error: AppError | Error, requestId?: string): ApiResponse<never> {
  const fallbackRequestId = requestId || (
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" 
      ? crypto.randomUUID() 
      : "req-" + Date.now().toString(36)
  );

  const code = error instanceof AppError ? error.code : "INTERNAL_SERVER_ERROR";
  const message = error.message || "An unexpected error occurred";
  
  // Include stack/details only if NODE_ENV is not production
  const showDetails = process.env.NODE_ENV !== "production";
  const details = showDetails ? (error.stack || error) : undefined;

  return {
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
    meta: {
      source: "database",
      generationMs: 0,
      cached: false,
      requestId: fallbackRequestId,
    },
  };
}
