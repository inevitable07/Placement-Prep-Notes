/**
 * @file enums.ts
 * @description Centralized enums and allowed arrays for domains, difficulties, and API inputs.
 */

/** Valid topic subject domain categories */
export const NOTE_DOMAINS = [
  "DSA",
  "OS",
  "Networks",
  "Database",
  "SystemDesign",
  "WebDev",
  "DevOps",
] as const;

/** Target difficulty mapping for stored notes */
export const NOTE_DIFFICULTIES = [
  "Beginner",
  "Intermediate",
  "Advanced",
] as const;

/** Generation job states */
export const NOTE_STATUSES = [
  "generating",
  "complete",
  "failed",
] as const;

/** User subscription tiers */
export const USER_PLANS = [
  "FREE",
  "PRO",
  "ADMIN",
] as const;

/** Supported levels for incoming AI note requests */
export const NOTE_GENERATION_LEVELS = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
] as const;

/** Allowed bookmark action types */
export const BOOKMARK_ACTIONS = [
  "add",
  "remove",
] as const;
