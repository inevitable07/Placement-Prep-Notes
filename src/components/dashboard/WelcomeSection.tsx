"use client";

/**
 * @file WelcomeSection.tsx
 * @description Greeting section centered on the workspace.
 */

import React from "react";
import { useUser } from "@clerk/nextjs";
import { Zap } from "lucide-react";

interface WelcomeSectionProps {
  children?: React.ReactNode;
}

export default function WelcomeSection({ children }: WelcomeSectionProps) {
  const { user } = useUser();
  const firstName = user?.firstName;
  const greeting = firstName ? `Welcome back, ${firstName}.` : "Welcome back.";

  return (
    <section className="flex flex-col items-center justify-center min-h-[60vh] max-w-3xl mx-auto text-center px-4 select-none">
      {/* Primary Accessible Page Heading */}
      <h1 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight leading-tight">
        {greeting}
      </h1>

      {/* Subtitle explanatory caption */}
      <p className="text-base font-normal text-muted mt-3">
        Search any topic to generate interview-ready notes instantly.
      </p>

      {/* Embedded Input Composer Container */}
      <div className="w-full mt-10 flex justify-center">
        {children}
      </div>

      {/* Subtle Gemini branding credentials */}
      <div className="flex items-center gap-1.5 mt-4 text-muted">
        <Zap size={12} className="text-muted" />
        <span className="text-xs font-medium">Powered by Gemini</span>
      </div>
    </section>
  );
}
