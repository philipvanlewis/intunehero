"use client";

/**
 * AI Chat Widget Component
 * Floating chat interface for user interactions with the AI
 */

import React, { useState, useEffect } from "react";
import { useCopilotContext } from "@copilotkit/react-core";
import { isAIConfigured, AI_ACTIONS, USER_INSTRUCTIONS } from "@/lib/ai";

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  // Get copilot context
  const context = useCopilotContext();

  // Initialize configured state
  useEffect(() => {
    setIsConfigured(isAIConfigured());
  }, []);

  // Don't render if not configured
  if (!isConfigured) {
    return null;
  }

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all"
        title="Open AI Assistant"
        aria-label="Open AI Assistant"
      >
        <ChatIcon />
      </button>

      {/* Chat Widget Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-40 w-96 h-[600px] bg-white rounded-lg shadow-xl flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold">IntuneHero AI Assistant</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Welcome Message */}
            <div className="text-gray-600 text-sm">
              <p className="font-semibold text-gray-800">Hello! 👋</p>
              <p className="mt-2">{USER_INSTRUCTIONS.welcome}</p>

              {/* Quick Suggestions */}
              <div className="mt-4 space-y-2">
                <p className="font-semibold text-gray-800 text-xs">Try asking:</p>
                {USER_INSTRUCTIONS.suggestions.slice(0, 3).map((suggestion, idx) => (
                  <button
                    key={idx}
                    className="block w-full text-left text-xs p-2 bg-gray-100 hover:bg-gray-200 rounded text-blue-600"
                    onClick={() => {
                      // This would be handled by the textarea
                      const textarea = document.querySelector(
                        "[data-copilot-textarea]"
                      ) as HTMLTextAreaElement;
                      if (textarea) {
                        textarea.value = suggestion;
                        textarea.focus();
                      }
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t p-4 bg-gray-50 rounded-b-lg">
            <textarea
              placeholder="Ask me anything about your Intune configurations..."
              className="w-full border rounded p-2 resize-none focus:outline-none focus:border-blue-500"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-2">
              Powered by AI • Context-aware responses
            </p>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Simple chat icon SVG
 */
function ChatIcon() {
  return (
    <svg
      className="w-6 h-6"
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
    </svg>
  );
}
