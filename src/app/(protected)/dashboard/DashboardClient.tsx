"use client";

/**
 * @file DashboardClient.tsx
 * @description Client controller orchestrating user inputs, simulated note generator status bars, and placeholder note groups.
 */

import React, { useState } from "react";
import WelcomeSection from "@/components/dashboard/WelcomeSection";
import Composer from "@/components/dashboard/Composer";

export default function DashboardClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastSearched, setLastSearched] = useState<string | null>(null);

  const handleGenerate = (topic: string) => {
    setIsLoading(true);
    setLastSearched(topic);
    console.log("Generating notes for:", topic);

    // Simulate async generation task delay
    // TODO: Replace with real API call in Module 04
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="w-full min-h-[70vh] md:min-h-[80vh] flex flex-col items-center justify-center">
      {/* Personalized Welcome Composer Frame */}
      <WelcomeSection>
        <div className="flex flex-col items-center w-full">
          <Composer onGenerate={handleGenerate} isLoading={isLoading} />
          
          {/* Calm, inline loading status indicator */}
          {isLoading && lastSearched && (
            <p className="text-sm text-[#64748b] mt-3 font-medium animate-pulse text-center">
              Generating notes for &quot;{lastSearched}&quot;...
            </p>
          )}
        </div>
      </WelcomeSection>
    </div>
  );
}
