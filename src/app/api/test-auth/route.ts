/**
 * @file route.ts
 * @description Developer-only testing endpoint to verify auth status and helper methods.
 * Restricts access in production environments, returning 404.
 */

import { NextResponse } from "next/server";
import { getAuthUser, AuthError } from "@/lib/auth/getAuthUser";

export async function GET() {
  // Guard: Disable access in production environment
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Not available" },
      { status: 404 }
    );
  }

  try {
    const { userId, sessionId } = await getAuthUser();

    return NextResponse.json({
      userId,
      sessionId,
      timestamp: new Date().toISOString(),
    }, { status: 200 });
  } catch (err) {
    if (err instanceof AuthError && err.code === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Internal Server Error: ${message}` },
      { status: 500 }
    );
  }
}
