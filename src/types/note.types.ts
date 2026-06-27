/**
 * @file note.types.ts
 * @description Shared TypeScript interfaces for Note data modeling.
 */

export type NoteStatus = "generating" | "complete" | "failed";
export type NoteDomain =
  | "DSA"
  | "OS"
  | "Networks"
  | "Database"
  | "SystemDesign"
  | "WebDev"
  | "DevOps";
export type NoteDifficulty = "Beginner" | "Intermediate" | "Advanced";
export type NoteSource = "ai" | "cache" | "database";

export interface INotePreview {
  id?: string;
  topic: string;
  slug: string;
  domain: NoteDomain;
  difficulty: NoteDifficulty;
  status: NoteStatus;
  createdAt: Date | string;
}

export interface INoteContent {
  introduction?: string;
  sections?: Array<{
    title: string;
    body: string;
    codeSnippet?: string;
    language?: string;
  }>;
  summary?: string;
  faq?: Array<{
    question: string;
    answer: string;
  }>;
}

export interface INoteDetails {
  id: string;
  topic: string;
  slug: string;
  hash: string;
  content: INoteContent | Record<string, unknown>;
  status: NoteStatus;
  domain: NoteDomain;
  difficulty: NoteDifficulty;
  viewCount: number;
  source: NoteSource;
  generationMs: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}
