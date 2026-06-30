/**
 * @file NoteService.ts
 * @description Note business service layer. Coordinates validation, search logging, caching, and note lookups.
 */

import { NoteRepository } from "@/lib/db/repositories/NoteRepository";
import { HistoryRepository } from "@/lib/db/repositories/HistoryRepository";
import { UserRepository } from "@/lib/db/repositories/UserRepository";
import { normalizeTopic, generateTopicHash } from "@/lib/api/schemas";
import { generateSlug, detectDomain, isValidObjectId } from "@/lib/utils/helpers";
import { STUB_NOTE_CONTENT } from "@/lib/mock/stubNote";
import { getCachedNote, setCachedNote } from "@/lib/cache/redisStub";
import { AppError } from "@/lib/errors/AppError";
import { NoteDocument } from "@/lib/db/models/Note";

export class NoteService {
  /**
   * Generates a new note or resolves it from cache/database if it already exists.
   * Logs history records, updates user generation limits, and triggers view increments.
   * 
   * @param {string} userId - Auth session user ID.
   * @param {string} topic - User-entered search topic.
   * @param {string} level - Selected difficulty tier constraint ('BEGINNER' | 'INTERMEDIATE' | 'ADVANCED').
   */
  static async generateNote(
    userId: string,
    topic: string,
    level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
  ) {
    const normalizedTopic = normalizeTopic(topic);
    const hash = await generateTopicHash(normalizedTopic);

    // 1. Redis cache lookup (stub)
    const cached = await getCachedNote(hash);
    if (cached) {
      return {
        noteId: cached._id.toString(),
        note: cached.content,
        isNew: false,
        source: "cache" as const,
        cacheStatus: "HIT" as const,
        preview: {
          id: cached._id.toString(),
          topic: cached.topic,
          slug: cached.slug,
          domain: cached.domain,
          difficulty: cached.difficulty,
          status: cached.status,
          createdAt: cached.createdAt,
        },
      };
    }

    // 2. MongoDB lookup
    const existing = await NoteRepository.findByHash(hash);
    if (existing) {
      // Fire and forget view increment
      NoteRepository.incrementViewCount(existing._id.toString()).catch((err) =>
        console.error("[NoteService] Failed to increment view count on hit:", err)
      );

      // Register study history log (source: database)
      await HistoryRepository.addEntry({
        userId,
        topic: existing.topic,
        noteId: existing._id.toString(),
        source: "database",
      });

      return {
        noteId: existing._id.toString(),
        note: existing.content,
        isNew: false,
        source: "database" as const,
        cacheStatus: "MISS" as const,
        preview: {
          id: existing._id.toString(),
          topic: existing.topic,
          slug: existing.slug,
          domain: existing.domain,
          difficulty: existing.difficulty,
          status: existing.status,
          createdAt: existing.createdAt,
        },
      };
    }

    // 3. Stub AI Generation
    const domain = detectDomain(normalizedTopic);
    const slug = generateSlug(normalizedTopic);
    const dbDifficulty = level === "BEGINNER" ? "Beginner" : level === "ADVANCED" ? "Advanced" : "Intermediate";

    // Save initial note stub to MongoDB
    const note = await NoteRepository.createNote({
      topic: normalizedTopic,
      slug,
      hash,
      status: "complete", // Complete for Phase 1 as mock content is populated immediately
      domain,
      difficulty: dbDifficulty,
      content: STUB_NOTE_CONTENT as unknown as NoteDocument["content"],
    });

    // Populate Redis stub cache
    await setCachedNote(hash, note);

    // Register search history (source: ai)
    await HistoryRepository.addEntry({
      userId,
      topic: normalizedTopic,
      noteId: note._id.toString(),
      source: "ai",
    });

    // Increment user note total limit checks
    await UserRepository.incrementNoteCount(userId);

    return {
      noteId: note._id.toString(),
      note: STUB_NOTE_CONTENT,
      isNew: true,
      source: "ai" as const,
      cacheStatus: "MISS" as const,
      preview: {
        id: note._id.toString(),
        topic: note.topic,
        slug: note.slug,
        domain: note.domain,
        difficulty: note.difficulty,
        status: note.status,
        createdAt: note.createdAt,
      },
    };
  }

  /**
   * Resolves a note document from the database using its ObjectId.
   * Increments view counts in a fire-and-forget manner.
   * 
   * @param {string} id - Target Note Object ID.
   * @returns {Promise<NoteDocument>} Stored note data document.
   */
  static async getNoteById(id: string): Promise<NoteDocument> {
    if (!isValidObjectId(id)) {
      throw new AppError("Invalid note ID format", "INVALID_INPUT", 400);
    }

    const note = await NoteRepository.findById(id);
    if (!note) {
      throw new AppError("Note not found", "NOT_FOUND", 404);
    }

    // Fire and forget view increment
    NoteRepository.incrementViewCount(id).catch((err) =>
      console.error("[NoteService] Failed to increment view count on fetch:", err)
    );

    return note;
  }
}
