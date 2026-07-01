"use client";

/**
 * @file Composer.tsx
 * @description AI prompt text area composer with dynamic expansion, validation and submission handlers.
 */

import React, { useState, useRef, useEffect } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

interface ComposerProps {
  onGenerate: (topic: string) => void;
  isLoading?: boolean;
}

export default function Composer({ onGenerate, isLoading = false }: ComposerProps) {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize the textarea to fit content, up to a maximum height
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [inputValue]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = () => {
    if (isLoading) return;

    const trimmedValue = inputValue.trim();
    if (trimmedValue.length < 3) {
      setError("Please enter at least 3 characters.");
      return;
    }

    onGenerate(trimmedValue);
    setInputValue(""); // Clear input on success
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isButtonDisabled = inputValue.trim().length < 3 || isLoading;

  return (
    <div className="w-full max-w-3xl">
      <div
        role="search"
        aria-label="Generate notes for a topic"
        className="w-full bg-panel border border-border rounded-2xl px-6 py-4 transition-all duration-200 focus-within:border-[#EC6530] flex flex-col"
      >
        {/* Input Textarea Area */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask about Docker, System Design, Binary Trees..."
          disabled={isLoading}
          aria-label="Topic to generate notes for"
          className="w-full bg-transparent border-none outline-none focus:ring-0 resize-none text-foreground text-base font-normal placeholder-muted leading-relaxed p-0"
          style={{ maxHeight: "120px" }}
        />

        {/* Action Bottom Bar */}
        <div className="flex items-center justify-between mt-3">
          {/* Left spacer for future voice and attachment controls */}
          <div className="flex items-center gap-2">
            {/* TODO: Voice and attachment controls (future modules) */}
          </div>

          {/* Right side generate trigger and usage hint */}
          <div className="flex flex-col items-end gap-1.5">
            <button
              onClick={handleSubmit}
              disabled={isButtonDisabled}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-150 ${
                isButtonDisabled
                  ? "bg-[#EC6530]/40 opacity-40 cursor-not-allowed"
                  : "bg-[#EC6530] hover:bg-[#d55220] cursor-pointer"
              }`}
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <span>Generate</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
            <span className="text-[10px] text-muted/60 select-none font-medium">
              Press Enter to generate
            </span>
          </div>
        </div>
      </div>

      {/* Inline Validation Error Layer */}
      {error && (
        <p className="text-xs text-red-400 mt-2 ml-1 animate-fade-in font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
