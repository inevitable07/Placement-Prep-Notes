/**
 * @file validation.ts
 * @description Centralized validation constants for the API contract and database schemas.
 */

/** Expected length of the truncated SHA256 topic hash for caching/deduplication */
export const HASH_LENGTH = 16;

/** Minimum allowed character length for search topics */
export const MIN_TOPIC_LENGTH = 3;

/** Maximum allowed character length for search topics */
export const MAX_TOPIC_LENGTH = 100;

/** Maximum character length for bookmark folders */
export const MAX_FOLDER_LENGTH = 50;

/** Minimum query limit for history retrieval */
export const MIN_HISTORY_LIMIT = 1;

/** Maximum query limit for history retrieval to prevent server overload */
export const MAX_HISTORY_LIMIT = 50;

/** Default number of items returned in paginated history queries */
export const DEFAULT_HISTORY_LIMIT = 20;

/** Default number of skipped items in paginated history queries */
export const DEFAULT_HISTORY_SKIP = 0;
