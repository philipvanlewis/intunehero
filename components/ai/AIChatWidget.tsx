"use client";

/**
 * AI Chat Widget Component
 * Uses CopilotKit's CopilotPopup for seamless AI integration
 * Provides a floating chat interface for user interactions with the AI
 */

import React from "react";
import { CopilotPopup } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";

console.log("[AIChatWidget] Component file loaded");

export function AIChatWidget() {
  console.log("[AIChatWidget] Function called - rendering component");

  return (
    <>
      {/* CopilotPopup handles all chat UI, messaging, and API integration */}
      <CopilotPopup
        labels={{
          title: "IntuneHero AI Assistant",
          placeholder:
            "Ask me anything about your Intune configurations...",
        }}
        defaultOpen={false}
      />
    </>
  );
}
