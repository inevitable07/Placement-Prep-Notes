/**
 * @file AppLayout.tsx
 * @description Outermost persistent layout shell containing the sidebar, navbar, and workspace scroll panel.
 */

import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0a0a] text-[#e2e8f0] font-sans antialiased">
      {/* Persistent Sidebar for Desktop screens */}
      <Sidebar />

      {/* Main Workspace Frame */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Navigation Bar for Mobile screens */}
        <Navbar />

        {/* Scrollable Main Content Panel */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
