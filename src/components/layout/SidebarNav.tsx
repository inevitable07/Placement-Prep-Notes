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
import { useWorkspace } from "@/context/WorkspaceContext";

export default function SidebarNav() {
  const pathname = usePathname();
  const {
    recentNotes,
    activeNote,
    selectNoteFromHistory,
    resetWorkspace,
    isHistoryLoading,
  } = useWorkspace();

  const primaryNav = [
    {
      name: "New Note",
      href: "/dashboard",
      icon: PenLine,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        resetWorkspace();
      },
    },
    { name: "My Notes", href: "/dashboard/notes", icon: FileText },
    { name: "Bookmarks", href: "/dashboard/bookmarks", icon: Bookmark },
    { name: "Export", href: "/dashboard/export", icon: Download },
  ];

  return (
    <div className="flex-1 flex flex-col gap-6 mt-6 px-3 overflow-hidden min-h-0">
      {/* Workspace Navigation Group */}
      <div className="flex-shrink-0">
        <div className="px-3 mb-2 text-xs font-medium tracking-widest text-muted uppercase select-none">
          Workspace
        </div>
        <nav className="flex flex-col gap-1">
          {primaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href && !activeNote;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={item.onClick}
                className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-150 border-l-2 ${
                  isActive
                    ? "bg-[#EC6530]/10 text-[#EC6530] border-[#EC6530]"
                    : "bg-transparent text-muted border-transparent hover:bg-hover hover:text-foreground"
                }`}
              >
                <Icon
                  size={18}
                  className={`transition-colors duration-150 ${
                    isActive ? "text-[#EC6530]" : "text-muted group-hover:text-foreground"
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Recent Notes History Group */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="px-3 mb-2 text-xs font-medium tracking-widest text-muted uppercase select-none">
          Recent Notes
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-1">
          {isHistoryLoading ? (
            /* Skeleton Loading States matching capsule elements */
            <div className="flex flex-col gap-2 animate-pulse px-1.5 mt-1">
              {[...Array(4)].map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-secondary/50 border border-transparent h-[34px]"
                >
                  <div className="h-2.5 w-2/3 bg-muted/20 rounded" />
                  <div className="h-3 w-10 bg-muted/20 rounded" />
                </div>
              ))}
            </div>
          ) : recentNotes.length === 0 ? (
            /* Styled Empty State matching Claude style visual card */
            <div className="px-3 py-4 text-center border border-dashed border-border rounded-xl mx-2 bg-panel/30 select-none">
              <p className="text-xs font-semibold text-foreground">No recent notes yet.</p>
              <p className="text-[10px] text-muted mt-1 leading-relaxed">
                Generate your first note to get started.
              </p>
            </div>
          ) : (
            /* Populated Recent Notes List */
            recentNotes.map((note) => {
              const isActive = activeNote?.noteId === note.id;

              return (
                <button
                  key={note.slug}
                  onClick={() => note.id && selectNoteFromHistory(note.id)}
                  className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-150 border-l-2 w-full text-left cursor-pointer focus:outline-none ${
                    isActive
                      ? "bg-[#EC6530]/10 text-[#EC6530] border-[#EC6530] font-medium"
                      : "bg-transparent text-muted border-transparent hover:bg-hover hover:text-foreground font-normal"
                  }`}
                >
                  <span className="truncate flex-1 text-left">{note.topic}</span>
                  <span className="text-[9px] font-semibold tracking-wider text-muted bg-hover border border-border px-1.5 py-0.5 rounded flex-shrink-0 select-none uppercase">
                    {note.domain}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Account Navigation Group */}
      <div className="flex-shrink-0">
        <div className="px-3 mb-2 text-xs font-medium tracking-widest text-muted uppercase select-none">
          Account
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-muted/50 select-none border-l-2 border-transparent">
            <div className="flex items-center gap-3">
              <Settings size={18} className="text-muted/50" />
              <span>Settings</span>
            </div>
            <span className="text-[10px] font-semibold bg-hover text-muted px-1.5 py-0.5 rounded border border-border">
              Soon
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
