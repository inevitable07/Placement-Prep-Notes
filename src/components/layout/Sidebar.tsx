/**
 * @file Sidebar.tsx
 * @description Persistent desktop sidebar containing the product branding, main navigations, and user profile information.
 */

import { currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import SidebarNav from "./SidebarNav";
import SidebarCloseButton from "./SidebarCloseButton";

export default async function Sidebar() {
  const user = await currentUser();
  const firstName = user?.firstName || "User";

  return (
    <aside className="flex flex-col w-full h-full select-none">
      {/* Logo Branding Header Area */}
      <div className="pt-6 px-5 pb-4 flex items-center justify-between">
        <span className="text-xl font-bold tracking-tight text-foreground">
          PrepAI
        </span>
        <SidebarCloseButton />
      </div>
      <div className="border-b border-border mx-5" />

      {/* Main Navigations List */}
      <SidebarNav />

      {/* User Session Info Footer Section */}
      <div className="mt-auto px-4 pb-6 flex flex-col gap-4">
        <div className="border-t border-border pt-4" />
        <div className="flex items-center gap-3">
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "h-8 w-8 rounded-lg border border-border",
              },
            }}
          />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-foreground truncate">
              {firstName}
            </span>
            <span className="text-xs text-muted truncate">
              Free Plan
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
