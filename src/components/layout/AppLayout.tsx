/**
 * @file AppLayout.tsx
 * @description Outermost persistent layout shell containing the sidebar, navbar, and workspace scroll panel.
 */

import React from "react";
import Sidebar from "./Sidebar";
import LayoutShell from "./LayoutShell";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <LayoutShell sidebar={<Sidebar />}>
      {children}
    </LayoutShell>
  );
}
