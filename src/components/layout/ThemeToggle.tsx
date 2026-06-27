"use client";

/**
 * @file ThemeToggle.tsx
 * @description Theme switch button toggling light mode (#F3F4F4) and dark mode.
 */

import React, { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, []);

  const toggleTheme = (event: React.MouseEvent<HTMLButtonElement>) => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    
    // Check if browser supports View Transition API and user prefers normal motion
    const supportsViewTransition = 
      typeof document.startViewTransition === "function" && 
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!supportsViewTransition) {
      setTheme(nextTheme);
      localStorage.setItem("theme", nextTheme);
      document.documentElement.setAttribute("data-theme", nextTheme);
      return;
    }

    const x = event.clientX;
    const y = event.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // Set CSS custom properties on documentElement for the circular clip path
    document.documentElement.style.setProperty("--ripple-x", `${x}px`);
    document.documentElement.style.setProperty("--ripple-y", `${y}px`);
    document.documentElement.style.setProperty("--ripple-r", `${endRadius}px`);

    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setTheme(nextTheme);
        localStorage.setItem("theme", nextTheme);
        document.documentElement.setAttribute("data-theme", nextTheme);
      });
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg border border-[#1f1f1f] bg-[#111111] hover:bg-[#1a1a1a] text-[#64748b] hover:text-[#e2e8f0] transition-all duration-150 cursor-pointer flex items-center justify-center focus:outline-none"
      aria-label="Toggle Color Theme"
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
