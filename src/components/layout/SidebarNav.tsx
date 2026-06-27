"use client";

/**
 * @file SidebarNav.tsx
 * @description Client navigation wrapper managing active path highlighting and routing transitions.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PenLine,
  FileText,
  Bookmark,
  Download,
  Settings,
} from "lucide-react";

export default function SidebarNav() {
  const pathname = usePathname();

  const primaryNav = [
    { name: "New Note", href: "/dashboard", icon: PenLine },
    { name: "My Notes", href: "/dashboard/notes", icon: FileText },
    { name: "Bookmarks", href: "/dashboard/bookmarks", icon: Bookmark },
    { name: "Export", href: "/dashboard/export", icon: Download },
  ];

  return (
    <div className="flex-1 flex flex-col gap-6 mt-6 px-3">
      {/* Workspace Navigation Group */}
      <div>
        <div className="px-3 mb-2 text-xs font-medium tracking-widest text-[#64748b] uppercase select-none">
          Workspace
        </div>
        <nav className="flex flex-col gap-1">
          {primaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-150 border-l-2 ${
                  isActive
                    ? "bg-indigo-500/10 text-indigo-400 border-indigo-500"
                    : "bg-transparent text-[#64748b] border-transparent hover:bg-[#1a1a1a] hover:text-[#e2e8f0]"
                }`}
              >
                <Icon
                  size={18}
                  className={`transition-colors duration-150 ${
                    isActive ? "text-indigo-400" : "text-[#64748b] group-hover:text-[#e2e8f0]"
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Account Navigation Group */}
      <div>
        <div className="px-3 mb-2 text-xs font-medium tracking-widest text-[#64748b] uppercase select-none">
          Account
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-[#64748b]/50 select-none border-l-2 border-transparent">
            <div className="flex items-center gap-3">
              <Settings size={18} className="text-[#64748b]/50" />
              <span>Settings</span>
            </div>
            <span className="text-[10px] font-semibold bg-[#1a1a1a] text-[#64748b] px-1.5 py-0.5 rounded border border-[#1f1f1f]">
              Soon
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
