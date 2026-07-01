/**
 * @file DashboardClient.tsx
 * @description Client controller orchestrating user inputs, workspace states, and transition rendering.
 */

"use client";

import React from "react";
import WelcomeSection from "@/components/dashboard/WelcomeSection";
import Composer from "@/components/dashboard/Composer";
import WorkspaceRenderer from "@/components/dashboard/WorkspaceRenderer";
import { useWorkspace } from "@/context/WorkspaceContext";

export default function DashboardClient() {
  const { state, generateNewNote, isLoading } = useWorkspace();

  const handleGenerate = (topic: string) => {
    generateNewNote(topic);
  };

  /**
   * 1. EMPTY STATE LAYOUT
   * Centered onboarding composer with greeting section
   */
  if (state === "EMPTY") {
    return (
      <div className="w-full min-h-[70vh] md:min-h-[80vh] flex flex-col items-center justify-center animate-fade-in select-none">
        <WelcomeSection>
          <div className="flex flex-col items-center w-full">
            <Composer onGenerate={handleGenerate} isLoading={isLoading} />
          </div>
        </WelcomeSection>
      </div>
    );
  }

  /**
   * 2. ACTIVE STATE LAYOUT (LOADING, GENERATED, ERROR)
   * Claude-inspired persistent top-pinned composer and scrollable workspace content
   */
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 select-none animate-fade-in">
      {/* Composer Container pinned at the top */}
      <div className="w-full bg-secondary/80 backdrop-blur sticky top-0 py-2 z-40 border-b border-border/50">
        <Composer onGenerate={handleGenerate} isLoading={isLoading} />
      </div>

      {/* Main Workspace content */}
      <div className="w-full flex-1">
        <WorkspaceRenderer />
      </div>
    </div>
  );
}
