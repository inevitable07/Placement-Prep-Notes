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
      className="p-2 rounded-lg border border-border bg-panel hover:bg-hover text-muted hover:text-foreground transition-all duration-150 cursor-pointer flex items-center justify-center focus:outline-none"
      aria-label="Collapse Sidebar"
    >
      <PanelLeftClose size={16} />
    </button>
  );
}
