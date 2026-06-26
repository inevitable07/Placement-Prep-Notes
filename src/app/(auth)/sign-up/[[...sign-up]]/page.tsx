/**
 * @file page.tsx
 * @description The Clerk Sign-Up page. Centers the standard Clerk SignUp widget
 * inside a full viewport black background container.
 */

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-[#0B0B0F]">
      <SignUp />
    </main>
  );
}
