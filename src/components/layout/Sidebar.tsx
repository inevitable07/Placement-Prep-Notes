/**
 * @file Sidebar.tsx
 * @description Persistent desktop sidebar containing the product branding, main navigations, and user profile information.
 */

import { currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import SidebarNav from "./SidebarNav";

export default async function Sidebar() {
  const user = await currentUser();
  const firstName = user?.firstName || "User";

  return (
    <aside className="hidden md:flex flex-col w-[240px] h-full bg-[#111111] border-r border-[#1f1f1f] flex-shrink-0 select-none">
      {/* Logo Branding Header Area */}
      <div className="pt-6 px-5 pb-4">
        <span className="text-xl font-bold tracking-tight text-[#e2e8f0]">
          PrepAI
        </span>
      </div>
      <div className="border-b border-[#1f1f1f] mx-5" />

      {/* Main Navigations List */}
      <SidebarNav />

      {/* User Session Info Footer Section */}
      <div className="mt-auto px-4 pb-6 flex flex-col gap-4">
        <div className="border-t border-[#1f1f1f] pt-4" />
        <div className="flex items-center gap-3">
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "h-8 w-8 rounded-lg border border-[#1f1f1f]",
              },
            }}
          />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-[#e2e8f0] truncate">
              {firstName}
            </span>
            <span className="text-xs text-[#64748b] truncate">
              Free Plan
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
