/**
 * @file client.ts
 * @description API Client Layer for all frontend API calls.
 */

import { ApiMeta } from "./response";
import { INoteContent } from "@/types/note.types";

/**
 * Custom error structure mapping API failures.
 */
export class ClientApiError extends Error {
  public code: string;
  public status: number;
  public details?: unknown;

  constructor(message: string, code: string, status: number, details?: unknown) {
    super(message);
    this.name = "ClientApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

interface RawEnvelope<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: unknown;
  };
  meta?: ApiMeta;
}

/**
 * Reusable JSON fetch request execution wrapper.
 * Consumes the standard API response envelope: { success, data, error, meta }.
 * 
 * @template T - Expected data payload type.
 * @param {string} path - Target API route endpoint.
 * @param {RequestInit} [options] - Standard request options.
 * @returns {Promise<{ data: T; meta: ApiMeta }>} Standard envelope mapping.
 */
async function request<T>(path: string, options?: RequestInit): Promise<{ data: T; meta: ApiMeta }> {
  const res = await fetch(path, options);
  
  let payload: RawEnvelope<T>;
  try {
    payload = await res.json();
  } catch {
    throw new ClientApiError("Invalid JSON response from server", "INVALID_RESPONSE", res.status);
  }

  if (!res.ok || !payload.success || !payload.data) {
    const errorMsg = payload.error?.message || "An unexpected error occurred";
    const errorCode = payload.error?.code || "UNKNOWN_ERROR";
    throw new ClientApiError(errorMsg, errorCode, res.status, payload.error?.details);
  }

  return {
    data: payload.data,
    meta: payload.meta as ApiMeta,
  };
}

/**
 * Trigger AI Note generation.
 * 
 * @param {string} topic - Normalized or raw user query.
 * @param {'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'} [level='INTERMEDIATE'] - Selected difficulty constraint.
 */
export async function generateNote(
  topic: string,
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" = "INTERMEDIATE"
) {
  return request<{
    noteId: string;
    note: INoteContent;
    isNew: boolean;
    isBookmarked: boolean;
    preview: {
      id: string;
      topic: string;
      slug: string;
      domain: string;
      difficulty: string;
      status: string;
      createdAt: string;
    };
  }>("/api/generate-note", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, level }),
  });
}

/**
 * Retrieve paginated user search history.
 * 
 * @param {number} [limit=6] - Pagination size.
 * @param {number} [skip=0] - Offset offset.
 */
export async function getHistory(limit: number = 6, skip: number = 0) {
  return request<{
    items: Array<{
      _id: string;
      userId: string;
      topic: string;
      noteId: string;
      source: string;
      searchedAt: string;
    }>;
    total: number;
    limit: number;
    skip: number;
  }>(`/api/history?limit=${limit}&skip=${skip}`);
}

/**
 * Fetch a note's complete content details by MongoDB ObjectId.
 * 
 * @param {string} id - Target Note ID.
 */
export async function getNote(id: string) {
  return request<{
    id: string;
    topic: string;
    slug: string;
    domain: string;
    difficulty: string;
    content: INoteContent;
    status: string;
    viewCount: number;
    isBookmarked: boolean;
    createdAt: string;
  }>(`/api/notes/${id}`);
}

/**
 * Toggles a note's saved state.
 * 
 * @param {string} noteId - Target Note ID.
 * @param {'add' | 'remove'} action - Toggle action.
 * @param {string} [folder='General'] - Folder categorization.
 */
export async function toggleBookmark(noteId: string, action: "add" | "remove", folder?: string) {
  return request<{
    bookmarked: boolean;
    noteId: string;
  }>("/api/bookmarks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ noteId, action, folder }),
  });
}
