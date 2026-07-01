"use client";

/**
 * @file NoteCard.tsx
 * @description A premium minimal document-preview card displaying metadata, badges, and bookmark status.
 */

import React from "react";
import Link from "next/link";
import { Bookmark, Calendar, ArrowRight } from "lucide-react";
import { INotePreview } from "@/types/note.types";

interface NoteCardProps {
  note: INotePreview;
  isBookmarked?: boolean;
  onBookmarkToggle?: (slug: string, e: React.MouseEvent) => void;
}

export default function NoteCard({
  note,
  isBookmarked = false,
  onBookmarkToggle,
}: NoteCardProps) {
  const formattedDate = note.createdAt
    ? new Date(note.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div className="relative group w-full bg-panel border border-border rounded-xl p-5 transition-all duration-200 hover:border-[#EC6530] flex flex-col justify-between min-h-[160px]">
      {/* Top Header Badge Row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {/* Domain Category Badge */}
          <span className="text-[10px] font-semibold uppercase tracking-wider bg-secondary text-muted border border-border px-2 py-0.5 rounded select-none">
            {note.domain}
          </span>
          {/* Difficulty Level Badge */}
          <span className="text-[10px] font-semibold uppercase tracking-wider bg-secondary text-muted border border-border px-2 py-0.5 rounded select-none">
            {note.difficulty}
          </span>
        </div>

        {/* Bookmark Icon Toggle Button */}
        {onBookmarkToggle && (
          <button
            onClick={(e) => onBookmarkToggle(note.slug, e)}
            className="text-muted hover:text-[#EC6530] transition-colors focus:outline-none focus:ring-1 focus:ring-[#EC6530] rounded p-1 cursor-pointer"
            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark note"}
          >
            <Bookmark
              size={16}
              className={isBookmarked ? "fill-[#EC6530] text-[#EC6530]" : "text-current"}
            />
          </button>
        )}
      </div>

      {/* Note Title Topic Area */}
      <div className="mt-4 flex-1">
        <Link href={`/dashboard/notes/${note.slug}`} className="focus:outline-none">
          <h3 className="text-base font-semibold text-foreground group-hover:text-white transition-colors line-clamp-2 leading-snug">
            {note.topic}
          </h3>
        </Link>
      </div>

      {/* Footer Info Row */}
      <div className="flex items-center justify-between mt-5 pt-3 border-t border-border/50 text-xs text-muted">
        <div className="flex items-center gap-3 select-none">
          {formattedDate && (
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              <span>{formattedDate}</span>
            </span>
          )}
        </div>

        {/* Action Link Icon */}
        <Link
          href={`/dashboard/notes/${note.slug}`}
          className="flex items-center gap-1 text-muted group-hover:text-[#EC6530] transition-colors font-medium focus:outline-none"
        >
          <span>Read</span>
          <ArrowRight size={12} className="transform group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
