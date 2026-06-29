/**
 * @file schemas.ts
 * @description API Contract Layer & Schema Definitions.
 * 
 * CRITICAL ARCHITECTURAL RULES:
 * 1. This file is the single source of truth for every external API input contract.
 * 2. Every incoming API request must be validated through these schemas.
 * 3. Route handlers must import schemas from this file only; never redefine rules.
 * 4. Validation must occur before any Repository, Redis, Gemini, or MongoDB interaction.
 */

import { z } from "zod";
import crypto from "crypto";
import {
  HASH_LENGTH,
  MIN_TOPIC_LENGTH,
  MAX_TOPIC_LENGTH,
  MAX_FOLDER_LENGTH,
  MIN_HISTORY_LIMIT,
  MAX_HISTORY_LIMIT,
  DEFAULT_HISTORY_LIMIT,
  DEFAULT_HISTORY_SKIP,
} from "@/lib/constants/validation";
import { NOTE_GENERATION_LEVELS, BOOKMARK_ACTIONS } from "@/lib/constants/enums";

/**
 * GenerateNoteSchema
 * Validates request payload data for note generation triggers.
 */
export const GenerateNoteSchema = z.object({
  topic: z.string()
    .trim()
    .min(MIN_TOPIC_LENGTH, `Topic must be at least ${MIN_TOPIC_LENGTH} characters`)
    .max(MAX_TOPIC_LENGTH, `Topic cannot exceed ${MAX_TOPIC_LENGTH} characters`)
    .refine(
      (val) => {
        const cleaned = val.trim();
        // Reject empty or whitespace-only inputs
        if (cleaned.length === 0) return false;
        // Must contain at least one letter or number (prevents punctuation-only search)
        const withoutPunctuation = cleaned.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’[\]<>@|\\+*=^%]/g, "");
        return withoutPunctuation.trim().length > 0;
      },
      { message: "Topic must contain at least one letter or number and not consist solely of punctuation" }
    )
    .refine(
      (val) => {
        // Reject control characters explicitly
        return !/[\x00-\x1F\x7F-\x9F]/.test(val);
      },
      { message: "Topic cannot contain control characters" }
    ),
  level: z.enum(NOTE_GENERATION_LEVELS)
    .optional()
    .default("INTERMEDIATE"),
});

/**
 * GetNoteParamsSchema
 * Validates route parameters (e.g. note identifier lookup values).
 */
export const GetNoteParamsSchema = z.object({
  id: z.string().min(1, "Note ID is required"),
});

/**
 * BookmarkSchema
 * Validates request body properties for bookmarking or folder updates.
 */
export const BookmarkSchema = z.object({
  noteId: z.string().min(1, "Note ID is required"),
  action: z.enum(BOOKMARK_ACTIONS, {
    message: "Action must be either 'add' or 'remove'",
  }),
  folder: z.string()
    .max(MAX_FOLDER_LENGTH, `Folder name cannot exceed ${MAX_FOLDER_LENGTH} characters`)
    .optional()
    .default("General"),
});

/**
 * HistoryQuerySchema
 * Validates URL query string parameters for paginated search history.
 */
export const HistoryQuerySchema = z.object({
  limit: z.coerce.number()
    .int("Limit must be an integer")
    .min(MIN_HISTORY_LIMIT, `Limit must be at least ${MIN_HISTORY_LIMIT}`)
    .max(MAX_HISTORY_LIMIT, `Limit cannot exceed ${MAX_HISTORY_LIMIT}`)
    .optional()
    .default(DEFAULT_HISTORY_LIMIT),
  skip: z.coerce.number()
    .int("Skip must be an integer")
    .min(0, "Skip cannot be negative")
    .optional()
    .default(DEFAULT_HISTORY_SKIP),
});

// Export inferred TypeScript types for contract reuse across layers
export type GenerateNoteInput = z.infer<typeof GenerateNoteSchema>;
export type GetNoteParams = z.infer<typeof GetNoteParamsSchema>;
export type BookmarkInput = z.infer<typeof BookmarkSchema>;
export type HistoryQuery = z.infer<typeof HistoryQuerySchema>;

/**
 * Normalizes user search topics to generate identical keys for equivalent topics.
 * Performs Unicode NFKC normalization, removes control characters, trims edges,
 * lowercases letters, and collapses repeated inner whitespaces into a single space.
 * 
 * @param {string} topic - Raw user-entered topic query.
 * @returns {string} Clean, normalized topic string.
 * 
 * @example
 * normalizeTopic("  Docker   Compose  ") // returns "docker compose"
 */
export function normalizeTopic(topic: string): string {
  if (!topic) return "";
  return topic
    .normalize("NFKC")
    .replace(/[\x00-\x1F\x7F-\x9F]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/**
 * Generates a deterministic hash of the normalized topic string.
 * Used for Redis cache keying, MongoDB note.hash field matching, and semantic caching.
 * Declared async for compliance with specification signatures and future compatibility.
 * 
 * @param {string} normalizedTopic - Normalized topic output from normalizeTopic.
 * @returns {Promise<string>} First 16 characters of the SHA-256 hex digest.
 * 
 * @example
 * await generateTopicHash("docker") // returns "ab3f9c..."
 */
export async function generateTopicHash(normalizedTopic: string): Promise<string> {
  const hash = crypto.createHash("sha256").update(normalizedTopic).digest("hex");
  return hash.slice(0, HASH_LENGTH);
}
