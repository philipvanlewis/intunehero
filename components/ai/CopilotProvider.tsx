"use client";

/**
 * CopilotKit Provider Component
 * Wraps the application with CopilotKit context
 */

import React from "react";
import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";

interface CopilotProviderProps {
  children: React.ReactNode;
}

export function CopilotProvider({ children }: CopilotProviderProps) {
  const runtimeUrl =
    process.env.NEXT_PUBLIC_COPILOT_RUNTIME_URL || "/api/copilot";

  // Always wrap with CopilotKit to avoid hydration mismatches
  // The AI widget will handle visibility based on configuration
  return (
    <CopilotKit runtimeUrl={runtimeUrl}>
      {children}
    </CopilotKit>
  );
}
