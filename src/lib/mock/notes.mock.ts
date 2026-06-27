/**
 * @file notes.mock.ts
 * @description Mock note dataset simulating future database responses during frontend development.
 * 
 * CRITICAL NOTE: This file only simulates Repository responses during frontend development.
 * Replace this dataset with NoteRepository/API responses in Module 04.
 */

import { INotePreview } from "@/types/note.types";

export const MOCK_NOTES: INotePreview[] = [
  {
    topic: "Docker",
    slug: "docker",
    domain: "DevOps",
    difficulty: "Beginner",
    status: "complete",
    createdAt: new Date("2026-06-25"),
  },
  {
    topic: "System Design Basics",
    slug: "system-design-basics",
    domain: "SystemDesign",
    difficulty: "Intermediate",
    status: "complete",
    createdAt: new Date("2026-06-26"),
  },
  {
    topic: "Binary Search Trees",
    slug: "binary-search-trees",
    domain: "DSA",
    difficulty: "Advanced",
    status: "complete",
    createdAt: new Date("2026-06-27"),
  },
  {
    topic: "Operating Systems",
    slug: "operating-systems",
    domain: "OS",
    difficulty: "Intermediate",
    status: "complete",
    createdAt: new Date("2026-06-27"),
  },
  {
    topic: "REST vs GraphQL",
    slug: "rest-vs-graphql",
    domain: "WebDev",
    difficulty: "Intermediate",
    status: "complete",
    createdAt: new Date("2026-06-27"),
  },
];
