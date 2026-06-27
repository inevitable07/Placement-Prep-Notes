"use client";

/**
 * @file LayoutShell.tsx
 * @description Client shell component holding collapsible sidebar states, theme toggle triggers and layout dimensions.
 */

import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import ThemeToggle from "./ThemeToggle";
import { PanelLeftOpen } from "lucide-react";

interface LayoutShellProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export default function LayoutShell({ sidebar, children }: LayoutShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleToggle = () => {
      setIsCollapsed((prev) => !prev);
    };

    window.addEventListener("toggle-sidebar", handleToggle);
    return () => {
      window.removeEventListener("toggle-sidebar", handleToggle);
    };
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0a0a] text-[#e2e8f0] font-sans antialiased">
      {/* Collapsible Sidebar Wrapper */}
      <div
        className={`transition-all duration-300 ease-in-out flex flex-col h-full shrink-0 border-r border-[#1f1f1f] bg-[#111111] overflow-hidden ${
          isCollapsed ? "w-0 border-r-0" : "w-[240px]"
        }`}
      >
        <div className="w-[240px] flex flex-col h-full select-none">
          {sidebar}
        </div>
      </div>

      {/* Workspace Panel Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        {/* Mobile Header Menu */}
        <Navbar />

        {/* Global Floating Theme Controller */}
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>

        {/* Floating Sidebar Restore Toggler when collapsed */}
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="absolute top-4 left-4 z-50 p-2 rounded-lg border border-[#1f1f1f] bg-[#111111] hover:bg-[#1a1a1a] text-[#64748b] hover:text-[#e2e8f0] transition-all duration-150 cursor-pointer flex items-center justify-center"
            aria-label="Expand Sidebar"
          >
            <PanelLeftOpen size={16} />
          </button>
        )}

        {/* Workspace Scroll Panel */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
