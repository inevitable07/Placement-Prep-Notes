/**
 * @file WorkspaceRenderer.tsx
 * @description Document viewer rendering note metadata, badges, bookmark selectors, and structured sections.
 */

"use client";

import React, { useRef, useEffect } from "react";
import { Bookmark, Calendar, Zap, AlertTriangle, RotateCcw, Clock } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";

export default function WorkspaceRenderer() {
  const {
    state,
    activeNote,
    isLoading,
    error,
    currentTopic,
    generationMs,
    source,
    cacheStatus,
    generateNewNote,
    toggleActiveBookmark,
    clearError,
  } = useWorkspace();

  const bottomRef = useRef<HTMLDivElement>(null);

  // Automatically scroll to the note content on successful note generation
  useEffect(() => {
    if (state === "GENERATED" && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [state, activeNote?.noteId]);

  const handleRetry = () => {
    if (currentTopic) {
      generateNewNote(currentTopic);
    }
  };

  /**
   * 1. SKELETON LOADING STATE
   * A premium animated skeleton layout mimicking the actual note structures
   */
  if (state === "LOADING" || isLoading) {
    return (
      <div className="w-full flex flex-col gap-6 animate-pulse select-none" aria-busy="true">
        {/* Title and Badges Row */}
        <div className="flex flex-col gap-3">
          <div className="h-4 w-28 bg-[#1f1f1f] rounded" />
          <div className="h-8 w-2/3 bg-[#1f1f1f] rounded-lg" />
          <div className="flex gap-2">
            <div className="h-5 w-16 bg-[#1f1f1f] rounded" />
            <div className="h-5 w-24 bg-[#1f1f1f] rounded" />
          </div>
        </div>

        {/* Intro Card */}
        <div className="w-full bg-[#111111] border border-[#1f1f1f] rounded-xl p-5 flex flex-col gap-3">
          <div className="h-4 w-full bg-[#1f1f1f] rounded" />
          <div className="h-4 w-5/6 bg-[#1f1f1f] rounded" />
        </div>

        {/* Detailed Sections */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div className="h-6 w-1/3 bg-[#1f1f1f] rounded" />
            <div className="h-4 w-full bg-[#1f1f1f] rounded" />
            <div className="h-4 w-full bg-[#1f1f1f] rounded" />
            {/* Mock Code block */}
            <div className="w-full h-32 bg-[#161616] border border-[#1f1f1f] rounded-lg mt-2" />
          </div>
        </div>
      </div>
    );
  }

  /**
   * 2. ERROR STATE
   * A clean error card with custom codes and a retry button
   */
  if (state === "ERROR" || error) {
    return (
      <div className="w-full bg-red-950/20 border border-red-900/50 rounded-xl p-6 flex flex-col items-center gap-4 text-center select-none animate-fade-in">
        <AlertTriangle size={36} className="text-red-500" />
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-red-200">Generation Failed</h3>
          <p className="text-sm text-red-400 max-w-lg">
            {error || "An unexpected error occurred while parsing your request."}
          </p>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-4 py-2 bg-[#EC6530] hover:bg-[#d55220] text-white text-sm font-medium rounded-lg transition-all cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Retry Search</span>
          </button>
          <button
            onClick={clearError}
            className="px-4 py-2 bg-[#111111] hover:bg-[#1a1a1a] border border-[#1f1f1f] text-sm font-medium rounded-lg text-[#64748b] hover:text-[#e2e8f0] transition-all cursor-pointer"
          >
            <span>Cancel</span>
          </button>
        </div>
      </div>
    );
  }

  /**
   * 3. EMPTY STATE OR MISSING NOTE
   */
  if (state === "EMPTY" || !activeNote) {
    return null;
  }

  /**
   * 4. GENERATED NOTE STATE
   * Renders the structured note layout matching active schemas
   */
  const content = activeNote.content;
  const formattedDate = activeNote.createdAt
    ? new Date(activeNote.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <article className="w-full flex flex-col gap-8 animate-fade-in pb-16" ref={bottomRef}>
      {/* 4.1 Header Badges and Title Row */}
      <header className="flex flex-col gap-3.5 border-b border-[#1f1f1f]/50 pb-5">
        <div className="flex items-center justify-between gap-4">
          {/* Metadata Badges */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-[#111111] text-[#64748b] border border-[#1f1f1f] px-2 py-0.5 rounded select-none">
              {activeNote.domain}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-[#111111] text-[#64748b] border border-[#1f1f1f] px-2 py-0.5 rounded select-none">
              {activeNote.difficulty}
            </span>
          </div>

          {/* Bookmark Button */}
          <button
            onClick={toggleActiveBookmark}
            className="text-[#64748b] hover:text-[#EC6530] transition-colors focus:outline-none focus:ring-1 focus:ring-[#EC6530] rounded p-1.5 bg-[#111111] border border-[#1f1f1f] cursor-pointer flex items-center justify-center"
            aria-label={activeNote.isBookmarked ? "Remove bookmark" : "Bookmark note"}
          >
            <Bookmark
              size={16}
              className={activeNote.isBookmarked ? "fill-[#EC6530] text-[#EC6530]" : "text-current"}
            />
          </button>
        </div>

        {/* Note Title */}
        <h2 className="text-2xl md:text-3xl font-bold text-[#e2e8f0] tracking-tight leading-tight">
          {activeNote.topic}
        </h2>

        {/* Sub-meta details row */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-[#64748b] select-none">
          {formattedDate && (
            <span className="flex items-center gap-1.5">
              <Calendar size={12} />
              <span>Studied {formattedDate}</span>
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Clock size={12} />
            <span>5 min read</span>
          </span>
        </div>
      </header>

      {/* 4.2 Intro/Overview Section */}
      {content.introduction && (
        <section className="w-full bg-[#111111] border border-[#1f1f1f] rounded-xl p-5 md:p-6 text-[#e2e8f0] leading-relaxed text-sm md:text-base font-normal">
          <p>{content.introduction}</p>
        </section>
      )}

      {/* 4.3 Detailed Subsections */}
      {content.sections && content.sections.length > 0 && (
        <section className="flex flex-col gap-8">
          {content.sections?.map((section: { title: string; body: string; codeSnippet?: string; language?: string }, idx: number) => (
            <div key={idx} className="flex flex-col gap-3">
              <h3 className="text-lg md:text-xl font-semibold text-[#e2e8f0]">
                {section.title}
              </h3>
              <p className="text-sm md:text-base text-[#64748b] leading-relaxed">
                {section.body}
              </p>

              {/* Optional code snippet block */}
              {section.codeSnippet && (
                <div className="w-full bg-[#161616] border border-[#1f1f1f] rounded-lg overflow-hidden mt-2 font-mono text-xs md:text-sm">
                  {/* Code block header bar */}
                  <div className="flex items-center justify-between px-4 py-2 bg-[#111111] border-b border-[#1f1f1f]/80 select-none text-[10px] uppercase font-bold text-[#64748b]">
                    <span>{section.language || "code"}</span>
                  </div>
                  {/* Code block body */}
                  <pre className="p-4 overflow-x-auto text-[#a1a1aa] leading-relaxed">
                    <code>{section.codeSnippet}</code>
                  </pre>
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* 4.4 Note Summary Box */}
      {content.summary && (
        <section className="w-full bg-[#111111] border border-l-4 border-l-[#EC6530] border-[#1f1f1f] rounded-r-xl p-5 text-sm text-[#64748b] leading-relaxed">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#EC6530] mb-1 select-none">
            Summary Key-Takeaways
          </h4>
          <p>{content.summary}</p>
        </section>
      )}

      {/* 4.5 FAQ Accordion */}
      {content.faq && content.faq.length > 0 && (
        <section className="flex flex-col gap-4 border-t border-[#1f1f1f]/50 pt-6">
          <h3 className="text-lg md:text-xl font-semibold text-[#e2e8f0] select-none">
            Frequently Asked Questions
          </h3>
          <div className="flex flex-col gap-3">
            {content.faq?.map((faq: { question: string; answer: string }, idx: number) => (
              <div key={idx} className="bg-[#111111] border border-[#1f1f1f] rounded-lg p-4 flex flex-col gap-2">
                <span className="text-sm font-semibold text-[#e2e8f0]">
                  Q: {faq.question}
                </span>
                <span className="text-sm text-[#64748b] leading-relaxed">
                  A: {faq.answer}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4.6 Telemetry Metadata Info Block */}
      <footer className="border-t border-[#1f1f1f]/30 pt-6 flex flex-wrap items-center justify-between gap-4 text-[10px] font-semibold tracking-wider text-[#64748b]/50 select-none uppercase">
        <div className="flex items-center gap-1">
          <Zap size={10} className="text-[#EC6530]" />
          <span>
            Generated in {generationMs || 0}ms via {source || "ai"}
          </span>
          {cacheStatus && (
            <span className="ml-1 px-1 bg-[#1f1f1f] rounded border border-[#26272D] text-[9px]">
              {cacheStatus}
            </span>
          )}
        </div>
        <span>Phase 1 Stub generation</span>
      </footer>
    </article>
  );
}
