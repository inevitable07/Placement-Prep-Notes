# Placement Prep AI — Project Bootstrap & Authentication Foundation (Module 01)

This document explains the foundation setup, folder structure, Clerk authentication integration, and server-side components for the **Placement Prep AI** application.

---

## 1. Technical Stack Configurations
The project is initialized with:
- **Next.js 14.2.35** with the **App Router**.
- **TypeScript** in strict mode (configured via `tsconfig.json`).
- **Tailwind CSS** for custom design configuration (configured via `tailwind.config.ts` and `postcss.config.mjs`).
- **ESLint** configured for React and Next.js best practices (`.eslintrc.json`).
- **src/** folder structure containing all components, pages, routes, database connections, and helper libraries.

---

## 2. Dependencies Setup
The following core libraries are installed and configured in `package.json`:
- **`@clerk/nextjs`**: Authentication system using Clerk components and middleware (Next.js 14 compatible v5 installed).
- **`svix`**: Webhook verification utility to validate signature payloads.
- **`zod`**: Schema declaration and validation library.
- **`mongoose`**: MongoDB object modeling tool.
- **`@upstash/redis`**: Serverless Redis client for caching and rate limiting.
- **`@google/generative-ai`**: Official Google AI SDK for integrating Gemini models.
- **`@types/mongoose`**: Developer types for Mongoose schemas.

---

## 3. Clerk Provider & Premium SaaS Styling
The entire application layout is wrapped in the `<ClerkProvider>` within [layout.tsx](file:///e:/placementPrepAI/src/app/layout.tsx). 

- **Font Styling**: The application loads the **Inter** font using Next.js `next/font/google` and applies it as a utility variable. Global text and body styles utilize this font to provide a premium look.
- **Enterprise Dark Theme Palette**: The application and Clerk widgets are styled to match a rich black-charcoal palette (`#0B0B0F` base background and `#15161A` cards) mimicking enterprise-tier layout engines (like Linear or Vercel):
  - **Background**: `#0B0B0F` (applied to global HTML body, layouts, sign-in, sign-up, and dashboard wrappers)
  - **Card Surface**: `#15161A`
  - **Borders**: `#26272D`
  - **Indigo Primary**: `#6366F1`
  - **Buttons**: `#FFEBCC` (Light Cream background for primary buttons with `#0B0B0F` text)
  - **Text**: `#F5F5F5`
  - **Secondary Text**: `#A1A1AA`
  - **Inputs**: `#1B1C21` (clearly distinguished background with a `#26272D` border)
- **Clerk Appearance Configuration**: Custom configurations are declared directly inside the `appearance` property:
  - `card`: Overrides border radius (`16px`), introduces thin `#26272D` border lines, and attaches card shadows.
  - `formButtonPrimary`: Overrides colors to light cream (`#FFEBCC` background, `#0B0B0F` text) with hover states.
  - `formFieldInput`: Overrides inputs to background `#1B1C21` with borders `#26272D`.
  - `socialButtonsBlockButton`: Links button styling to input surface styles.
- **Global Theme Overrides**: [globals.css](file:///e:/placementPrepAI/src/app/globals.css) binds body background properties to `#0B0B0F` and typography to the Inter font.

---

## 4. Route Guarding Middleware
Global path protection is handled in [middleware.ts](file:///e:/placementPrepAI/src/middleware.ts) using Clerk's `clerkMiddleware()`:

- **Public Routes**: Access is permitted without login on:
  - `/` (Home landing page)
  - `/sign-in` (Login interface)
  - `/sign-up` (Signup interface)
  - `/api/webhooks/clerk` (External webhook callback for syncing users)
- **Protected Routes**: Access is guarded and requires authentication on:
  - `/dashboard`
  - `/api/*` (except clerk webhooks)
- **Redirects**: If an unauthenticated user attempts to load a protected path, they are automatically redirected to `/sign-in`.
- **Logs**: Every request triggers a middleware logger to output pathing and authentication state:
  ```typescript
  console.log("[Middleware] Path:", req.nextUrl.pathname, "| Auth:", isAuthenticated);
  ```
- **Path matching design**: To comply with `path-to-regexp` parsing limitations (which do not support regex negative lookaheads), route guarding is divided into two separate matcher blocks (`isProtectedRoute` for `/dashboard` and `/api/*`, and `isWebhookRoute` for `/api/webhooks/clerk`). The route is guarded only when the request matches the protected selector but does not match the webhook selector.

---

## 5. Root Route Redirection (Authentication-First Gateway)
The root route `/` is managed server-side inside [page.tsx](file:///e:/placementPrepAI/src/app/page.tsx):
- Operates as a Server Component.
- Fetches active auth state via `auth()`.
- Executes instant server redirects:
  - If authenticated → redirects to `/dashboard`.
  - If unauthenticated → redirects to `/sign-in`.
- Eliminates client-side layout flashing or default landing pages.

---

## 6. MongoDB Connection Singleton (Module 02-A)
The database connection singleton is initialized and managed inside [connection.ts](file:///e:/placementPrepAI/src/lib/db/connection.ts):
- **Problem Solved**: Local hot-reloading in Next.js re-evaluates JS modules, which can create multiple connection pools that rapidly exhaust database resources.
- **Cache Mechanism**: Mongoose connection references are stored in the NodeJS global scope as `global.mongooseConnection`. Subsequent calls immediately return the active connection promise instead of creating new instances.
- **Type Safety**: The global typescript namespace is extended with a custom typed property while bypassing ESLint `no-var` constraints.
- **Connection Flags**:
  - `bufferCommands`: `false` (fails fast on query dispatch if the connection is absent, rather than infinite buffering).
  - `dbName`: `"placement-prep-ai"` (targets database collection namespace).
- **Telemetry Listeners**: Attaches log handles to record `connected`, `error`, and `disconnected` events.

---

## 7. Webhook Signature Verification
The webhook handler is situated at [route.ts](file:///e:/placementPrepAI/src/app/api/webhooks/clerk/route.ts). It verifies the signatures sent with Clerk webhooks to secure the integration.

- **Replay Attack Prevention**: Signature validation using `svix` is mandatory. It ensures that the request was genuinely signed by Clerk and has not been intercepted, modified, or replayed by malicious third parties.
- **Event Handlers**:
  - `user.created`: Extracts user metadata (`id`, `primary email`, and `created_at` timestamp) to construct a MongoDB user document stub for future persistence.
  - `user.deleted`: Logs deletion telemetry to record user removals.
- **Error Handling**: The route is fully wrapped in error handlers returning a `400` status with descriptive error responses if validation fails, preventing generic `500` server errors.

---

## 8. Authentication Helpers (`getAuthUser`)
The canonical server authentication helper methods are exported in [getAuthUser.ts](file:///e:/placementPrepAI/src/lib/auth/getAuthUser.ts):

- **`getAuthUser()`**: Retrieves the current Clerk `userId` and `sessionId`. Throws an `AuthError` (message: `'UNAUTHORIZED'`, code: `'UNAUTHORIZED'`) if the user is not signed in.
- **`getOptionalAuthUser()`**: Returns the session details if authenticated, or `null` if unauthenticated.
- **JSDoc Specifications**: Detailed documentation is provided for both helpers to ensure developers call the correct method depending on path protection levels.

---

## 9. Developer Validation Endpoint
A local dev-only route is mounted at [route.ts](file:///e:/placementPrepAI/src/app/api/test-auth/route.ts) to verify auth configurations:

- **Guard**: Retracts endpoint access in production environments (checks `process.env.NODE_ENV === 'production'` and returns a `404` status).
- **Behavior**: Calls `getAuthUser()` internally. Returns `200` with the user session properties if logged in, or `401` with an `'UNAUTHORIZED'` payload if logged out.

---

## 10. Directory & File Structure
The project folder hierarchy is organized as follows:

```
placement-prep-ai/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── sign-in/[[...sign-in]]/page.tsx   # Centered SignIn UI Page with SaaS colors
│   │   │   └── sign-up/[[...sign-up]]/page.tsx   # Centered SignUp UI Page with SaaS colors
│   │   ├── (protected)/
│   │   │   └── dashboard/page.tsx                # Protected Server Dashboard with SaaS background
│   │   ├── api/
│   │   │   ├── test-auth/
│   │   │   │   └── route.ts                      # Developer Auth Validation route
│   │   │   └── webhooks/
│   │   │       └── clerk/route.ts                # Verified Webhook handler (Svix)
│   │   ├── globals.css                           # Global styling and Inter font configuration
│   │   ├── layout.tsx                            # Root Layout file with custom Clerk appearance
│   │   └── page.tsx                              # Authentication-first Server gateway page
│   ├── lib/
│   │   ├── auth/
│   │   │   └── getAuthUser.ts                    # Safely exported getAuthUser helpers
│   │   └── db/
│   │       └── connection.ts                     # MongoDB Cached singleton connection manager
│   └── middleware.ts                             # Clerk middleware route guarding
├── .env.local                                    # Local environment variables (ignored by Git)
├── .env.example                                  # Template environment keys (tracked by Git)
├── .gitignore                                    # Excludes .env.local, node_modules, and .next
├── package.json                                  # Dependency manifests
├── tsconfig.json                                 # TypeScript compiler configurations
└── implementation.md                             # This documentation file
```

---

## 11. Verification & Correctness
The application's compilation and packaging:
- `npx tsc --noEmit` runs with 0 errors.
- `npm run build` generates the production bundle and compiles all routes (including API endpoints and catch-all routes) successfully.
