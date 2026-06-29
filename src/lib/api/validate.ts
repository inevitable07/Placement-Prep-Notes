/**
 * @file validate.ts
 * @description Zod-based JSON request validation utilities.
 */

import { z } from "zod";
import { AppError } from "@/lib/errors/AppError";

/**
 * Extracts and formats the first error issue details from a ZodError instance.
 * 
 * @param {z.ZodError} error - Validation exception.
 * @returns {string} Clean error message string.
 */
function formatZodError(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return "Validation error";
  
  const path = issue.path.join(".");
  return path ? `[${path}]: ${issue.message}` : issue.message;
}

/**
 * Parses and validates request JSON body contents against a Zod Schema.
 * 
 * @template T - Target Schema type mapping.
 * @param {Request} request - Next.js/Web Standard Request object.
 * @param {z.ZodSchema<T>} schema - Zod validator mapping definition.
 * @returns {Promise<T>} Validated properties.
 * @throws {AppError} INVALID_JSON (400) if parse failed, or INVALID_INPUT (400) if schema verification failed.
 */
export async function validateRequest<T>(request: Request, schema: z.ZodSchema<T>): Promise<T> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    throw new AppError("Request body must be valid JSON", "INVALID_JSON", 400);
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    const formattedMsg = formatZodError(result.error);
    throw new AppError(`Invalid request body: ${formattedMsg}`, "INVALID_INPUT", 400);
  }

  return result.data;
}
