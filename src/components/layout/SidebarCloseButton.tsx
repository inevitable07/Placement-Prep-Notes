"use client";

/**
 * @file SidebarCloseButton.tsx
 * @description Button that collapses the sidebar by dispatching a custom toggle event.
 */

import React from "react";
import { PanelLeftClose } from "lucide-react";

export default function SidebarCloseButton() {
  const handleCollapse = () => {
    window.dispatchEvent(new Event("toggle-sidebar"));
  };

  return (
    <button
      onClick={handleCollapse}
      className="p-2 rounded-lg border border-[#1f1f1f] bg-[#111111] hover:bg-[#1a1a1a] text-[#64748b] hover:text-[#e2e8f0] transition-all duration-150 cursor-pointer flex items-center justify-center focus:outline-none"
      aria-label="Collapse Sidebar"
    >
      <PanelLeftClose size={16} />
    </button>
  );
}
