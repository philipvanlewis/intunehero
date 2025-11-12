"use client";

/**
 * CopilotKit Provider Component
 * Wraps the application with CopilotKit context
 */

import React from "react";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";
import { isAIConfigured } from "@/lib/ai";

interface CopilotProviderProps {
  children: React.ReactNode;
}

export function CopilotProvider({ children }: CopilotProviderProps) {
  const runtimeUrl =
    process.env.NEXT_PUBLIC_COPILOT_RUNTIME_URL || "/api/copilot";

  // Don't render CopilotKit if not configured
  if (!isAIConfigured()) {
    return <>{children}</>;
  }

  return (
    <CopilotKit runtimeUrl={runtimeUrl}>
      <div className="flex h-screen">
        {/* Main content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>

        {/* Optional: Sidebar for copilot (can be toggled) */}
        {/* <CopilotSidebar
          defaultOpen={false}
          labels={{
            title: "IntuneHero AI Assistant",
            initial: "How can I help you with your Intune configurations?",
          }}
        /> */}
      </div>
    </CopilotKit>
  );
}
