/**
 * @file AppError.ts
 * @description Custom application error class. Standardizes error responses 
 * across the application, containing custom codes and HTTP status codes.
 */

/**
 * Standard application error wrapping message, error code, and HTTP status code.
 */
export class AppError extends Error {
  public code: string;
  public statusCode: number;

  /**
   * Creates an instance of AppError.
   * @param {string} message - Descriptive error message text.
   * @param {string} code - Application-specific error identifier (e.g. 'DB_ERROR').
   * @param {number} statusCode - Target HTTP status code matching the exception context.
   */
  constructor(message: string, code: string, statusCode: number) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    
    // Set prototype chain explicitly for proper error subclass inheritance in TS
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
