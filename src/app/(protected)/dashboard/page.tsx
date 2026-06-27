/**
 * @file page.tsx
 * @description The dashboard home page. This page is a protected server component
 * that retrieves the authenticated userId from Clerk and renders a placeholder layout.
 */

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getOrCreateDbUser } from "@/lib/auth/getAuthUser";
import AppLayout from "@/components/layout/AppLayout";

export default async function DashboardPage() {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get full user details from Clerk to extract the primary email and sync to database
  const user = await currentUser();
  if (user) {
    const email = user.emailAddresses[0]?.emailAddress || "";
    if (email) {
      try {
        await getOrCreateDbUser(userId, email);
        console.log("[Dashboard] Database user verified/synced successfully:", userId);
      } catch (err) {
        console.error("[Dashboard] Failed to sync user to MongoDB:", err);
      }
    }
  }

  return (
    <AppLayout>
      {/* TODO: Render DashboardClient here (Prompt 03-B) */}
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold tracking-tight text-[#e2e8f0]">Workspace Dashboard</h2>
        <p className="text-[#64748b] text-sm">
          Welcome to your workspace. Start preparing for placements by generating notes.
        </p>
      </div>
    </AppLayout>
  );
}
