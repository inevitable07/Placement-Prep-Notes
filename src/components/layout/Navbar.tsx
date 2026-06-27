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
    <header className="flex md:hidden items-center justify-between px-4 h-[56px] bg-[#0a0a0a] border-b border-[#1f1f1f] w-full flex-shrink-0 select-none">
      <span className="text-xl font-bold tracking-tight text-[#e2e8f0]">
        PrepAI
      </span>
      <button
        onClick={toggleDrawer}
        className="text-[#64748b] hover:text-[#e2e8f0] transition-colors focus:outline-none cursor-pointer"
        aria-label="Toggle navigation menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    </header>
  );
}
