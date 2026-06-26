/**
 * @file middleware.ts
 * @description Global middleware implementing Clerk route guarding.
 * Restricts protected dashboard and API paths, logging request metrics.
 */

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define matchers for protected routes
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/api/(.*)",
]);

const isWebhookRoute = createRouteMatcher([
  "/api/webhooks/clerk(.*)",
]);

export default clerkMiddleware((auth, req) => {
  const { userId } = auth();
  const isAuthenticated = !!userId;

  // Log required metrics
  console.log("[Middleware] Path:", req.nextUrl.pathname, "| Auth:", isAuthenticated);

  // If hits a protected route and not authenticated, redirect to sign-in
  if (isProtectedRoute(req) && !isWebhookRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.[\\w]+$).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
