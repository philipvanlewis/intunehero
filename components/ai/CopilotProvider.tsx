"use client";

/**
 * CopilotKit Provider Component
 * Wraps the application with CopilotKit context
 */

import React, { ReactNode } from "react";
import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";

interface CopilotProviderProps {
  children: ReactNode;
}

export function CopilotProvider({ children }: CopilotProviderProps) {
  const runtimeUrl =
    process.env.NEXT_PUBLIC_COPILOT_RUNTIME_URL || "/api/copilot";

  return (
    <CopilotKit
      runtimeUrl={runtimeUrl}
      showDevConsole={process.env.NODE_ENV === 'development'}
    >
      {children}
    </CopilotKit>
  );
}
