/**
 * @file redisStub.ts
 * @description Passthrough stub cache layer preparing the app for Upstash Redis integrations.
 */

import { NoteDocument } from "@/lib/db/models/Note";

/**
 * Searches cache store for a note matching the given hash.
 * Currently returns null to always trigger a DB/AI resolution in Phase 1.
 * 
 * TODO Phase 2: Replace with Upstash Redis Client lookup.
 * 
 * @param {string} _hash - The topic hash.
 * @returns {Promise<NoteDocument | null>} Always returns null in Phase 1.
 */
export async function getCachedNote(_hash: string): Promise<NoteDocument | null> {
  // Log check context for telemetry
  console.log("[Redis] Cache lookup for hash:", _hash, "(stub - Phase 1)");
  return null;
}

/**
 * Saves a resolved note document to the cache store.
 * Currently runs as a no-op placeholder.
 * 
 * TODO Phase 2: Replace with Upstash Redis Client key-value set operation.
 * 
 * @param {string} _hash - The topic hash.
 * @param {NoteDocument} note - The note document data.
 * @returns {Promise<void>}
 */
export async function setCachedNote(_hash: string, note: NoteDocument): Promise<void> {
  console.log("[Redis] Cache store request for hash:", _hash, "topic:", note.topic, "(stub - Phase 1)");
  return;
}
