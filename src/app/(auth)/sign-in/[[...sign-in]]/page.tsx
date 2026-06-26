/**
 * @file page.tsx
 * @description The Clerk Sign-In page. Centers the standard Clerk SignIn widget
 * inside a full viewport black background container.
 */

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-[#0B0B0F]">
      <SignIn />
    </main>
  );
}
