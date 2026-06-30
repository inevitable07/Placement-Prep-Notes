/**
 * @file stubNote.ts
 * @description Standard static mock note data for Phase 1 stub generation responses.
 */

import { INoteContent } from "@/types/note.types";

/**
 * Realistic-looking mock data matching the INoteContent schema shape.
 * Used as a placeholder before the live Gemini API integration in Module 06.
 */
export const STUB_NOTE_CONTENT: INoteContent = {
  introduction: "This comprehensive study guide details the concepts, architecture, and practical implementations of the topic.",
  sections: [
    {
      title: "Core Concepts & Fundamentals",
      body: "An overview of the core pillars, including execution logic, resource allocations, and lifecycle mechanisms. Understanding these fundamentals is crucial for passing early-stage placement interviews.",
      codeSnippet: "// Core implementation showcase\nconst performTask = async () => {\n  console.log('PrepAI: Initializing processing pipeline...');\n  return true;\n};",
      language: "javascript",
    },
    {
      title: "Advanced Architecture & Topologies",
      body: "Diving deeper into design patterns, optimization heuristics, and performance profiling. Make sure to consider edge cases, scaling limits, and common production vulnerabilities.",
    },
  ],
  summary: "In summary, mastering this topic requires a strong understanding of both foundational theory and actual code patterns.",
  faq: [
    {
      question: "What is the primary trade-off to discuss during interviews?",
      answer: "Discuss speed versus memory allocation and outline typical profiling strategies.",
    },
  ],
};
