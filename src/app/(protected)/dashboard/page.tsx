/**
 * @file page.tsx
 * @description The dashboard home page. This page is a protected server component
 * that retrieves the authenticated userId from Clerk and renders a placeholder layout.
 */

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default function DashboardPage() {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // TODO: Replace with real dashboard in Module 03
  return (
    <main className="min-h-screen bg-[#0B0B0F] text-white flex flex-col items-center justify-center">
      <h1>Dashboard — Welcome, {userId}</h1>
    </main>
  );
}
