/**
 * @file helpers.ts
 * @description Centralized utility helpers for URL slugification, domain detection, and ID validation.
 */

import { NoteDomain } from "@/types/note.types";

/**
 * Validates whether a string matches the standard MongoDB 24-character hexadecimal ObjectId format.
 * 
 * @param {string} id - The potential lookup ID.
 * @returns {boolean} True if matching, false otherwise.
 */
export function isValidObjectId(id: string): boolean {
  return /^[a-f\d]{24}$/i.test(id);
}

/**
 * Generates a URL-friendly slug from a normalized topic.
 * Replaces spaces with single hyphens.
 * 
 * @param {string} normalizedTopic - Clean, normalized topic query.
 * @returns {string} URL-friendly slug.
 */
export function generateSlug(normalizedTopic: string): string {
  return normalizedTopic.replace(/ /g, "-");
}

/**
 * Dynamically detects the appropriate NoteDomain category based on search keywords.
 * Default fallback is 'WebDev'.
 * 
 * @param {string} topic - Normalized topic string.
 * @returns {NoteDomain} Detected domain category.
 */
export function detectDomain(topic: string): NoteDomain {
  const lower = topic.toLowerCase();
  
  if (
    lower.includes("docker") ||
    lower.includes("kubernetes") ||
    lower.includes("ci/cd") ||
    lower.includes("devops") ||
    lower.includes("git") ||
    lower.includes("jenkins") ||
    lower.includes("ansible")
  ) {
    return "DevOps";
  }

  if (
    lower.includes("react") ||
    lower.includes("nextjs") ||
    lower.includes("html") ||
    lower.includes("css") ||
    lower.includes("javascript") ||
    lower.includes("typescript") ||
    lower.includes("web") ||
    lower.includes("graphql") ||
    lower.includes("rest api")
  ) {
    return "WebDev";
  }

  if (
    lower.includes("tree") ||
    lower.includes("graph") ||
    lower.includes("array") ||
    lower.includes("search") ||
    lower.includes("sort") ||
    lower.includes("algorithm") ||
    lower.includes("dsa") ||
    lower.includes("binary") ||
    lower.includes("stack") ||
    lower.includes("queue") ||
    lower.includes("recursion")
  ) {
    return "DSA";
  }

  if (
    lower.includes("database") ||
    lower.includes("sql") ||
    lower.includes("nosql") ||
    lower.includes("mongodb") ||
    lower.includes("query") ||
    lower.includes("index") ||
    lower.includes("postgres") ||
    lower.includes("redis")
  ) {
    return "Database";
  }

  if (
    lower.includes("system design") ||
    lower.includes("microservices") ||
    lower.includes("load balancer") ||
    lower.includes("scaling") ||
    lower.includes("cache") ||
    lower.includes("distributed")
  ) {
    return "SystemDesign";
  }

  if (
    lower.includes("operating system") ||
    lower.includes("thread") ||
    lower.includes("process") ||
    lower.includes("os") ||
    lower.includes("memory management") ||
    lower.includes("concurrency")
  ) {
    return "OS";
  }

  if (
    lower.includes("network") ||
    lower.includes("tcp") ||
    lower.includes("ip") ||
    lower.includes("http") ||
    lower.includes("dns") ||
    lower.includes("routing") ||
    lower.includes("socket")
  ) {
    return "Networks";
  }

  return "WebDev";
}
