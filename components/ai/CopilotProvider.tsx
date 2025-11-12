'use client';

// CopilotKit Provider Component for IntuneHero
// Wraps the app with CopilotKit context

import { CopilotKit } from '@copilotkit/react-core';
import { getCopilotRuntimeURL } from '@/lib/ai/copilot-config';

interface CopilotProviderProps {
  children: React.ReactNode;
}

export function CopilotProvider({ children }: CopilotProviderProps) {
  const runtimeUrl = getCopilotRuntimeURL();

  return (
    <CopilotKit runtimeUrl={runtimeUrl}>
      {children}
    </CopilotKit>
  );
}
