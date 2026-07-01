/**
 * @file WorkspaceContext.tsx
 * @description Shared state context managing note generation, active workspaces, loading states, and sidebar navigation.
 */

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { generateNote, getHistory, getNote, toggleBookmark } from "@/lib/api/client";
import { INotePreview, NoteDomain, NoteDifficulty, NoteStatus, INoteContent } from "@/types/note.types";

export type WorkspaceState = "EMPTY" | "LOADING" | "GENERATED" | "ERROR";

export type ActiveNote = {
  noteId: string;
  topic: string;
  slug: string;
  domain: string;
  difficulty: string;
  content: INoteContent;
  status: string;
  isBookmarked: boolean;
  createdAt?: string | Date;
};

export interface WorkspaceContextType {
  state: WorkspaceState;
  activeNote: ActiveNote | null;
  recentNotes: INotePreview[];
  isLoading: boolean;
  isHistoryLoading: boolean;
  error: string | null;
  currentTopic: string;
  requestId: string | null;
  generationMs: number | null;
  cacheStatus: string | null;
  source: string | null;
  generateNewNote: (topic: string, level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED") => Promise<void>;
  selectNoteFromHistory: (noteId: string) => Promise<void>;
  toggleActiveBookmark: () => Promise<void>;
  fetchHistory: () => Promise<void>;
  clearError: () => void;
  resetWorkspace: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WorkspaceState>("EMPTY");
  const [activeNote, setActiveNote] = useState<ActiveNote | null>(null);
  const [recentNotes, setRecentNotes] = useState<INotePreview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTopic, setCurrentTopic] = useState("");
  const [requestId, setRequestId] = useState<string | null>(null);
  const [generationMs, setGenerationMs] = useState<number | null>(null);
  const [cacheStatus, setCacheStatus] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);

  /**
   * Fetch recent search history logs and map them to preview schema shapes.
   */
  const fetchHistory = async () => {
    setIsHistoryLoading(true);
    try {
      const res = await getHistory(20);
      const seen = new Set<string>();
      const uniqueMapped: INotePreview[] = [];

      for (const item of res.data.items) {
        const note = item.noteId as unknown as { _id: string; slug: string; domain: NoteDomain; difficulty: NoteDifficulty; status: NoteStatus };
        const id = note?._id || item.noteId;
        const slug = note?.slug || item.topic.toLowerCase().replace(/ /g, "-");
        
        if (!seen.has(slug)) {
          seen.add(slug);
          uniqueMapped.push({
            id,
            topic: item.topic,
            slug,
            domain: (note?.domain as NoteDomain) || "WebDev",
            difficulty: (note?.difficulty as NoteDifficulty) || "Intermediate",
            status: (note?.status as NoteStatus) || "complete",
            createdAt: item.searchedAt,
          });
        }
      }

      setRecentNotes(uniqueMapped.slice(0, 6));
    } catch (err) {
      console.error("[WorkspaceContext] Failed to fetch initial history:", err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  // Fetch initial history on component mount
  useEffect(() => {
    fetchHistory();
  }, []);

  /**
   * Triggers generation of a new note guide via API call.
   */
  const generateNewNote = async (
    topic: string,
    level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" = "INTERMEDIATE"
  ) => {
    setIsLoading(true);
    setState("LOADING");
    setError(null);
    setCurrentTopic(topic);
    setRequestId(null);
    setGenerationMs(null);
    setCacheStatus(null);
    setSource(null);

    try {
      const { data, meta } = await generateNote(topic, level);

      setActiveNote({
        noteId: data.noteId,
        topic: data.preview.topic,
        slug: data.preview.slug,
        domain: data.preview.domain,
        difficulty: data.preview.difficulty,
        content: data.note,
        status: data.preview.status,
        isBookmarked: data.isBookmarked,
        createdAt: data.preview.createdAt,
      });

      setRequestId(meta.requestId);
      setGenerationMs(meta.generationMs);
      setCacheStatus(meta.cacheStatus || null);
      setSource(meta.source || "ai");

      // Sync Sidebar Recent Notes immediately
      setRecentNotes((prev) => {
        const filtered = prev.filter((item) => item.slug !== data.preview.slug);
        return [data.preview as unknown as INotePreview, ...filtered].slice(0, 6);
      });

      setState("GENERATED");
    } catch (err: unknown) {
      const errorWithMsg = err as { message?: string };
      const msg = errorWithMsg.message || "An unexpected error occurred during note generation.";
      setError(msg);
      setState("ERROR");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetches an existing note by ID and displays it in the workspace.
   */
  const selectNoteFromHistory = async (noteId: string) => {
    setIsLoading(true);
    setState("LOADING");
    setError(null);
    setRequestId(null);
    setGenerationMs(null);
    setCacheStatus(null);
    setSource(null);

    try {
      const { data, meta } = await getNote(noteId);

      setActiveNote({
        noteId: data.id,
        topic: data.topic,
        slug: data.slug,
        domain: data.domain,
        difficulty: data.difficulty,
        content: data.content,
        status: data.status,
        isBookmarked: data.isBookmarked,
        createdAt: data.createdAt,
      });

      setCurrentTopic(data.topic);
      setRequestId(meta.requestId);
      setGenerationMs(meta.generationMs);
      setCacheStatus(meta.cacheStatus || null);
      setSource(meta.source || "database");

      // Promote note to top of recentNotes list if it already exists there
      setRecentNotes((prev) => {
        const matchingIndex = prev.findIndex((item) => item.id === noteId);
        if (matchingIndex !== -1) {
          const item = prev[matchingIndex];
          const filtered = prev.filter((_, idx) => idx !== matchingIndex);
          return [item, ...filtered];
        }
        return prev;
      });

      setState("GENERATED");
    } catch (err: unknown) {
      const errorWithMsg = err as { message?: string };
      const msg = errorWithMsg.message || "Failed to load note details.";
      setError(msg);
      setState("ERROR");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Idempotently toggles bookmark status of the active note guide.
   */
  const toggleActiveBookmark = async () => {
    if (!activeNote) return;
    
    const action = activeNote.isBookmarked ? "remove" : "add";
    try {
      const { data } = await toggleBookmark(activeNote.noteId, action);
      setActiveNote((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          isBookmarked: data.bookmarked,
        };
      });
    } catch (err) {
      console.error("[WorkspaceContext] Failed to toggle bookmark:", err);
    }
  };

  const clearError = () => {
    setError(null);
    if (state === "ERROR") {
      setState("EMPTY");
    }
  };

  const resetWorkspace = () => {
    setState("EMPTY");
    setActiveNote(null);
    setError(null);
    setCurrentTopic("");
    setRequestId(null);
    setGenerationMs(null);
    setCacheStatus(null);
    setSource(null);
  };

  return (
    <WorkspaceContext.Provider
      value={{
        state,
        activeNote,
        recentNotes,
        isLoading,
        error,
        currentTopic,
        requestId,
        generationMs,
        cacheStatus,
        source,
        isHistoryLoading,
        generateNewNote,
        selectNoteFromHistory,
        toggleActiveBookmark,
        fetchHistory,
        clearError,
        resetWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
