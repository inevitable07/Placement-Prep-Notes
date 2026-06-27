# Placement Prep AI — Project Bootstrap & Authentication Foundation (Module 01 & 02)

This document explains the technical configurations, design systems, routing structures, database connections, model definitions, repository layers, and webhook integrations for the **Placement Prep AI** application.

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

## 7. Mongoose Schemas & Database Models (Module 02-B)
Mongoose schemas and TypeScript interfaces are housed under `src/lib/db/models/`. Next.js hot-reload model duplication errors are prevented by caching declarations via `mongoose.models.ModelName || mongoose.model(...)`.

### A. User Model ([User.ts](file:///e:/placementPrepAI/src/lib/db/models/User.ts))
- **Interface**: `IUser`, `UserDocument` type.
- **Properties**: `clerkId` (string, required, unique), `email` (string, lowercase, required, unique), `plan` (enum: `"FREE" | "PRO" | "ADMIN"`), `totalNotes` (number), `streak` (number), `lastActive` (Date), and `preferences` (sub-document mapping skill levels and companies).
- **Indexes**: Unique indexes on `clerkId` and `email`.

### B. Note Model ([Note.ts](file:///e:/placementPrepAI/src/lib/db/models/Note.ts))
- **Interface**: `INote`, `NoteDocument` type.
- **Properties**: `topic` (min 2, max 100), `slug` (required, unique), `hash` (SHA256, required, unique), `content` (Mixed schema json payload), `status` (enum: `"generating" | "complete" | "failed"`), `domain` (enum: `"DSA" | "OS" | "Networks" | "Database" | "SystemDesign" | "WebDev" | "DevOps"`), `difficulty` (enum: `"Beginner" | "Intermediate" | "Advanced"`), `viewCount` (number), `source` (enum: `"ai" | "cache" | "database"`), and `generationMs` (number).
- **Indexes**: Unique indexes on `hash` and `slug`; full-text search index on `topic`; compound index on `domain` and `status`.

### C. History Model ([History.ts](file:///e:/placementPrepAI/src/lib/db/models/History.ts))
- **Interface**: `IHistory`, `HistoryDocument` type.
- **Properties**: `userId` (string, required), `topic` (string, required), `noteId` (ObjectId ref `"Note"`, required), `source` (enum: `"ai" | "cache" | "database"`), and `searchedAt` (Date).
- **Indexes**: TTL index on `searchedAt` configured for 7776000 seconds (90 days auto-delete); compound query index on `userId` and `searchedAt`.

### D. Bookmark Model ([Bookmark.ts](file:///e:/placementPrepAI/src/lib/db/models/Bookmark.ts))
- **Interface**: `IBookmark`, `BookmarkDocument` type.
- **Properties**: `userId` (string, required), `noteId` (ObjectId ref `"Note"`, required), and `folder` (string, default `"General"`).
- **Indexes**: Unique compound index on `userId` and `noteId` to prevent duplicate bookmarks.

### E. UserNote Model ([UserNote.ts](file:///e:/placementPrepAI/src/lib/db/models/UserNote.ts))
- **Architecture**: Acts as a personalization junction table. AI-generated note contents are cached globally in the shared `Note` collection. User-specific highlights, annotations, progress metrics, rating reviews, and study telemetry are tracked separately inside `UserNote` to prevent content duplication and optimize read scales.
- **Interface**: `IUserNote`, `UserNoteDocument` type.
- **Properties**:
  - `userId` (string, required)
  - `noteId` (ObjectId ref `"Note"`, required)
  - `savedAt` (Date)
  - `lastViewed` (Date)
  - `progress` (number, range 0 - 100)
  - `revisionCount` (number, default `0`)
  - `rating` (number, optional, range 1 - 5)
  - `personalSummary` (string, default `""`)
  - `highlights` (array of sub-documents matching `{ text, color: "yellow" | "green" | "blue" | "pink", createdAt }`)
  - `customTags` (array of strings)
  - `lastRevised` (Date, optional)
  - `chatCount` (number, default `0`)
  - `isArchived` (boolean, default `false`)
  - `favorite` (boolean, default `false`)
- **Indexes**: Unique compound index on `userId` and `noteId`; query index on `userId` for notes fetch.

---

## 8. AppError Class ([AppError.ts](file:///e:/placementPrepAI/src/lib/errors/AppError.ts))
A customized error abstraction extends standard JavaScript `Error` parameters.
- **Goal**: Standardizes error handling and hides raw database stack details (such as Mongoose internal error messages) from client or API callers.
- **Properties**:
  - `code`: Custom application-specific string code (e.g. `'DB_ERROR'`).
  - `statusCode`: Integer matching target HTTP status code (e.g. `500` or `404`).

---

## 9. Repository Abstraction Layer (Module 02-C)
Database calls from Next.js route endpoints must only transit through Repository static methods. Mongoose operations are shielded inside the repositories.

- **Connection Resolving**: Every static repository method executes `await connectDB()` at entry.
- **Error Wrapping**: Operations are wrapped inside `try/catch` handlers. Any caught exception is mapped and re-thrown as a typed `AppError`.
- **Query Optimization**: For query reading methods that do not modify properties, Mongoose `.lean()` is applied to return raw, plain JSON objects.

### A. UserRepository ([UserRepository.ts](file:///e:/placementPrepAI/src/lib/db/repositories/UserRepository.ts))
- `findByClerkId(clerkId)`: Lean search.
- `createUser(data)`: Creates a new user document with default configurations.
- `updatePlan(clerkId, plan)`: Updates subscription tiers (`"FREE" | "PRO" | "ADMIN"`).
- `incrementNoteCount(clerkId)`: Increments note counter by 1.
- `upsertFromWebhook(clerkId, email)`: Webhook helper to insert or update user profiles.

### B. NoteRepository ([NoteRepository.ts](file:///e:/placementPrepAI/src/lib/db/repositories/NoteRepository.ts))
- `findByHash(hash)`: Lean search. Used for deduplication.
- `findById(noteId)`: Lean search.
- `findBySlug(slug)`: Lean search.
- `createNote(data)`: Saves Note details.
- `upsertByHash(hash, data)`: Returns `{ note, isNew }` mapping newly-made entries.
- `incrementViewCount(noteId)`: Increments note views.
- `findRecentNotes(limit)`: Retrieves notes sorted by creation descending (default limit 10).

### C. HistoryRepository ([HistoryRepository.ts](file:///e:/placementPrepAI/src/lib/db/repositories/HistoryRepository.ts))
- `addEntry(data)`: Logs query records.
- `getRecentHistory(userId, limit, skip)`: Paginated lean history listings (default limit 20).
- `getHistoryCount(userId)`: Counts total entries.

### D. BookmarkRepository ([BookmarkRepository.ts](file:///e:/placementPrepAI/src/lib/db/repositories/BookmarkRepository.ts))
- `addBookmark(userId, noteId, folder)`: Saves a bookmark item.
- `removeBookmark(userId, noteId)`: Deletes a bookmark.
- `isBookmarked(userId, noteId)`: Returns boolean matching bookmark presence.
- `getUserBookmarks(userId)`: Lean list of user bookmarks.

---

## 10. Webhook & Database Synchronization (Module 02-D)
Binds Clerk authentication actions directly to Mongoose database updates:

- **Clerk Webhook route ([route.ts](file:///e:/placementPrepAI/src/app/api/webhooks/clerk/route.ts))**:
  - `user.created`: Extracts Clerk ID and email coordinates, calling `UserRepository.upsertFromWebhook` to sync records to MongoDB. Database failures are caught and logged, returning an HTTP `500` with a secure, masked message.
  - `user.deleted`: Logs deletions without removing documents, protecting user study histories.
- **Fallback User Sync Helper ([getAuthUser.ts](file:///e:/placementPrepAI/src/lib/auth/getAuthUser.ts))**:
  - `getOrCreateDbUser(clerkId, email)`: A static resolver called upon initial dashboard load. Instantiates user profiles inside MongoDB if webhook logs are delayed.

---

## 11. Authentication Helpers (`getAuthUser`)
The canonical server authentication helper methods are exported in [getAuthUser.ts](file:///e:/placementPrepAI/src/lib/auth/getAuthUser.ts):

- **`getAuthUser()`**: Retrieves the current Clerk `userId` and `sessionId`. Throws an `AuthError` (message: `'UNAUTHORIZED'`, code: `'UNAUTHORIZED'`) if the user is not signed in.
- **`getOptionalAuthUser()`**: Returns the session details if authenticated, or `null` if unauthenticated.
- **JSDoc Specifications**: Detailed documentation is provided for both helpers to ensure developers call the correct method depending on path protection levels.

---

## 12. Developer Validation Endpoint
A local dev-only route is mounted at [route.ts](file:///e:/placementPrepAI/src/app/api/test-auth/route.ts) to verify auth configurations:

- **Guard**: Retracts endpoint access in production environments (checks `process.env.NODE_ENV === 'production'` and returns a `404` status).
- **Behavior**: Calls `getAuthUser()` internally. Returns `200` with the user session properties if logged in, or `401` with an `'UNAUTHORIZED'` payload if logged out.

---

## 13. Directory & File Structure
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
│   │   │       └── clerk/route.ts                # Verified Webhook handler syncing to DB
│   │   ├── globals.css                           # Global styling and Inter font configuration
│   │   ├── layout.tsx                            # Root Layout file with custom Clerk appearance
│   │   └── page.tsx                              # Authentication-first Server gateway page
│   ├── lib/
│   │   ├── auth/
│   │   │   └── getAuthUser.ts                    # Safely exported getAuthUser & getOrCreateDbUser helpers
│   │   ├── errors/
│   │   │   └── AppError.ts                       # Standardized application AppError wrapping class
│   │   └── db/
│   │       ├── models/
│   │       │   ├── User.ts                       # Mongoose model for User
│   │       │   ├── Note.ts                       # Mongoose model for Note
│   │       │   ├── History.ts                    # Mongoose model for History
│   │       │   ├── Bookmark.ts                   # Mongoose model for Bookmark
│   │       │   └── UserNote.ts                   # Mongoose model for UserNote with Personalization
│   │       ├── repositories/
│   │       │   ├── UserRepository.ts             # Static repositories mapping User queries
│   │       │   ├── NoteRepository.ts             # Static repositories mapping Note queries
│   │       │   ├── HistoryRepository.ts          # Static repositories mapping History queries
│   │       │   └── BookmarkRepository.ts         # Static repositories mapping Bookmark queries
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

## 14. Verification & Correctness
The application's compilation and packaging:
- `npx tsc --noEmit` runs with 0 errors.
- `npm run build` generates the production bundle and compiles all routes (including API endpoints and catch-all routes) successfully.
