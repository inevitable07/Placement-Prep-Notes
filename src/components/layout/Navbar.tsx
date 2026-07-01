"use client";

/**
 * @file Navbar.tsx
 * @description Mobile-only navbar with drawer triggers.
 */

import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  // TODO: Connect to MobileDrawer component in future module
  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="flex md:hidden items-center justify-between px-4 h-[56px] bg-secondary border-b border-border w-full flex-shrink-0 select-none">
      <span className="text-xl font-bold tracking-tight text-foreground">
        PrepAI
      </span>
      <button
        onClick={toggleDrawer}
        className="text-muted hover:text-foreground transition-colors focus:outline-none cursor-pointer"
        aria-label="Toggle navigation menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    </header>
  );
}
