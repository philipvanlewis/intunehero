# CopilotKit Integration Guide for IntuneHero

## Executive Summary

This guide provides comprehensive instructions for integrating CopilotKit into the IntuneHero application (Phase 1 branch). CopilotKit is an open-source framework for building AI copilots, chatbots, and in-app agents that seamlessly integrate with React applications.

**Current Status:** IntuneHero has zero AI/chat dependencies and uses Next.js 14 with static export mode.

**Integration Goal:** Add an AI-powered copilot that can help users understand their Intune configurations, answer questions, and assist with export operations.

---

## Table of Contents

1. [What is CopilotKit?](#what-is-copilotkit)
2. [Key Features & Benefits](#key-features--benefits)
3. [Architecture Overview](#architecture-overview)
4. [Prerequisites & Setup](#prerequisites--setup)
5. [Step-by-Step Integration](#step-by-step-integration)
6. [Use Cases for IntuneHero](#use-cases-for-intunehero)
7. [Configuration Options](#configuration-options)
8. [Security Considerations](#security-considerations)
9. [Testing Strategy](#testing-strategy)
10. [Troubleshooting](#troubleshooting)

---

## What is CopilotKit?

CopilotKit is an open-source framework (MIT license, 24.9k+ GitHub stars) that enables developers to build AI-powered copilots directly into React applications. It provides:

- **React Hooks**: `useCopilotAction`, `useCopilotReadable`, `useCopilotChat`
- **UI Components**: `CopilotSidebar`, `CopilotPopup`, `CopilotChat`
- **Backend Runtime**: LLM integration layer supporting OpenAI, Anthropic, and others
- **Agent Integration**: Support for LangGraph, CrewAI, and custom agents
- **Generative UI**: Dynamic component rendering based on AI responses
- **Headless APIs**: Complete control over UI/UX

**Official Resources:**
- Documentation: https://docs.copilotkit.ai
- GitHub: https://github.com/CopilotKit/CopilotKit
- NPM: `@copilotkit/react-core`, `@copilotkit/react-ui`, `@copilotkit/runtime`

---

## Key Features & Benefits

### For IntuneHero

1. **Contextual Understanding**: Provide the AI with real-time access to Intune configurations, allowing intelligent Q&A
2. **Action Execution**: Enable the copilot to trigger exports, filter data, or navigate the UI
3. **Natural Language Queries**: Users can ask "Show me all Windows compliance policies" instead of manual filtering
4. **Export Assistance**: AI can suggest export formats, explain configurations, or generate summaries
5. **Onboarding Help**: Guide new users through setup and feature discovery

### Technical Benefits

- **Framework-Agnostic**: Works with Next.js App Router (our current setup)
- **TypeScript Support**: Fully typed APIs for better DX
- **Built-in Security**: Prompt injection protection and request validation
- **Streaming Support**: Real-time response generation
- **Flexible Architecture**: Choose between sidebar, popup, or custom UI

---

## Architecture Overview

### Current IntuneHero Architecture

```
┌─────────────────────────────────────────────┐
│         Browser (Client-Side Only)          │
│  ┌───────────────────────────────────────┐  │
│  │  Next.js 14 (Static Export)           │  │
│  │  - app/page.tsx (Main state)          │  │
│  │  - React hooks (useState/useEffect)   │  │
│  │  - Azure AD Auth (MSAL)               │  │
│  │  - Direct MS Graph API calls          │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### Post-CopilotKit Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser (Client-Side)                     │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Next.js 14 (Hybrid Mode)                              │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  CopilotKit Provider (app/layout.tsx)            │  │  │
│  │  │  - useCopilotReadable (Intune data context)      │  │  │
│  │  │  - useCopilotAction (Export/filter actions)      │  │  │
│  │  │  - CopilotSidebar (UI)                           │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │                                                          │  │
│  │  - Azure AD Auth (MSAL)                                 │  │
│  │  - Direct MS Graph API calls                            │  │
│  └────────────────────────────────────────────────────────┘  │
│                           ▲                                   │
│                           │ WebSocket/HTTP                    │
│                           ▼                                   │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Server-Side (app/api/copilotkit/route.ts)            │  │
│  │  - CopilotRuntime                                      │  │
│  │  - OpenAI/Anthropic Adapter                            │  │
│  │  - Request/Response handling                           │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   OpenAI/Anthropic API                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Prerequisites & Setup

### 1. Environment Requirements

- Node.js 18+ (currently have: compatible version)
- Next.js 14+ (currently have: 14.2.3 ✓)
- React 18+ (currently have: 18.3.1 ✓)
- TypeScript 5+ (currently have: 5.4.5 ✓)

### 2. LLM Provider Account

Choose one (or support multiple):

**OpenAI** (Recommended for Phase 1)
- Sign up: https://platform.openai.com/signup
- Create API key: https://platform.openai.com/api-keys
- Cost: ~$0.002/1K tokens (GPT-4o-mini)

**Anthropic Claude**
- Sign up: https://console.anthropic.com/
- Create API key: https://console.anthropic.com/settings/keys
- Cost: ~$0.003/1K tokens (Claude 3.5 Haiku)

**Azure OpenAI** (Alternative if already using Azure)
- Integrate with existing Azure subscription
- Use same authentication as Intune/Graph API
- Benefits: Same tenant, unified billing

### 3. Configuration Updates Required

**CRITICAL:** IntuneHero currently uses `output: 'export'` (static site generation) in `next.config.mjs`. This must be changed to support API routes.

---

## Step-by-Step Integration

### Phase 1: Backend Setup (Required Changes)

#### Step 1.1: Update Next.js Configuration

**File:** `next.config.mjs`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // REMOVE: output: 'export',  ← This blocks API routes
  // ADD: Hybrid mode (default)
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  // OPTIONAL: Keep trailing slash if needed
  trailingSlash: true,
};

export default nextConfig;
```

**Impact:** Application will now support server-side API routes while maintaining client-side rendering for most pages.

#### Step 1.2: Install CopilotKit Dependencies

```bash
npm install @copilotkit/react-core @copilotkit/react-ui @copilotkit/runtime
```

**For OpenAI:**
```bash
npm install openai
```

**For Anthropic:**
```bash
npm install @anthropic-ai/sdk
```

#### Step 1.3: Add Environment Variables

**File:** `.env.local` (create if doesn't exist)

```env
# Existing
NEXT_PUBLIC_CLIENT_ID=your-azure-ad-client-id

# NEW: CopilotKit Configuration
OPENAI_API_KEY=sk-...your-key-here
NEXT_PUBLIC_COPILOT_RUNTIME_URL=/api/copilotkit

# OPTIONAL: For Azure OpenAI
# AZURE_OPENAI_API_KEY=...
# AZURE_OPENAI_ENDPOINT=https://...
# AZURE_OPENAI_DEPLOYMENT=gpt-4o
```

**Security Note:** NEVER commit `.env.local` to git. Add to `.gitignore` (already configured).

#### Step 1.4: Create CopilotKit API Route

**File:** `app/api/copilotkit/route.ts` (NEW FILE)

```typescript
import { NextRequest } from 'next/server';
import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from '@copilotkit/runtime';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create OpenAI adapter
const serviceAdapter = new OpenAIAdapter({
  openai,
  model: 'gpt-4o-mini', // Cost-effective for Phase 1
});

// Create CopilotKit runtime
const runtime = new CopilotRuntime();

// Export POST handler for Next.js App Router
export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: '/api/copilotkit',
  });

  return handleRequest(req);
};
```

**Alternative: Anthropic Claude**

```typescript
import { CopilotRuntime, AnthropicAdapter, copilotRuntimeNextJSAppRouterEndpoint } from '@copilotkit/runtime';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const serviceAdapter = new AnthropicAdapter({
  anthropic,
  model: 'claude-3-5-haiku-20241022', // Fast and cost-effective
});

// ... rest is identical
```

#### Step 1.5: Test API Route

```bash
npm run dev
```

Visit: http://localhost:3000/api/copilotkit

Expected error: "Method GET not allowed" (only POST is implemented - this is correct!)

---

### Phase 2: Frontend Integration

#### Step 2.1: Wrap Application with CopilotKit Provider

**File:** `app/layout.tsx`

```typescript
import { CopilotKit } from '@copilotkit/react-core';
import '@copilotkit/react-ui/styles.css'; // Import CopilotKit styles

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CopilotKit
          runtimeUrl="/api/copilotkit"
          // Optional: Add custom headers (e.g., for authentication)
          // headers={{ 'X-Custom-Header': 'value' }}
        >
          {children}
        </CopilotKit>
      </body>
    </html>
  );
}
```

#### Step 2.2: Add CopilotKit UI Component

**Option A: Sidebar (Recommended)**

**File:** `app/page.tsx` (add at the end of the return statement)

```typescript
import { CopilotSidebar } from '@copilotkit/react-ui';

export default function Page() {
  // ... existing state and functions ...

  return (
    <CopilotSidebar
      defaultOpen={false}
      labels={{
        title: "IntuneHero Assistant",
        initial: "Hi! I'm your Intune configuration assistant. How can I help you today?",
      }}
    >
      {/* Wrap existing content */}
      <div className="min-h-screen bg-gray-50">
        {/* ... existing JSX ... */}
      </div>
    </CopilotSidebar>
  );
}
```

**Option B: Popup (Non-intrusive)**

```typescript
import { CopilotPopup } from '@copilotkit/react-ui';

export default function Page() {
  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* ... existing JSX ... */}
      </div>

      <CopilotPopup
        labels={{
          title: "IntuneHero Assistant",
          initial: "Hi! Ask me anything about your Intune configurations!",
        }}
      />
    </>
  );
}
```

**Option C: Custom Chat UI (Advanced)**

```typescript
import { useCopilotChat } from '@copilotkit/react-core';

function CustomCopilotChat() {
  const { messages, sendMessage, isLoading } = useCopilotChat();

  return (
    <div className="custom-chat-container">
      {/* Build your own UI */}
    </div>
  );
}
```

---

### Phase 3: Context Integration

#### Step 3.1: Provide Intune Data Context

**File:** `components/copilot/IntuneContext.tsx` (NEW FILE)

```typescript
'use client';

import { useCopilotReadable } from '@copilotkit/react-core';
import type { AllData } from '@/lib/types';

interface IntuneContextProps {
  allData: AllData;
  activeTab: 'profiles' | 'scripts' | 'compliance' | 'apps';
  selectedItems: Set<string>;
}

export function IntuneContext({ allData, activeTab, selectedItems }: IntuneContextProps) {
  // Provide current tab data to copilot
  useCopilotReadable({
    description: `The user is currently viewing the ${activeTab} tab`,
    value: activeTab,
  });

  // Provide current data counts
  useCopilotReadable({
    description: 'Summary of Intune resources',
    value: {
      totalProfiles: allData.profiles.length,
      totalScripts: allData.scripts.length,
      totalCompliance: allData.compliance.length,
      totalApps: allData.apps.length,
    },
  });

  // Provide currently visible items
  useCopilotReadable({
    description: `Detailed list of ${activeTab}`,
    value: allData[activeTab].map(item => ({
      id: item.id,
      name: item.displayName || item.name,
      description: item.description,
      // Include relevant metadata based on type
      ...(item.type === 'profile' && {
        platforms: item.platforms,
        lastModified: item.lastModifiedDateTime,
      }),
      ...(item.type === 'script' && {
        executionContext: item.executionContext,
        runAsAccount: item.runAsAccount,
      }),
    })),
  });

  // Provide selected items context
  if (selectedItems.size > 0) {
    useCopilotReadable({
      description: 'Currently selected items for export',
      value: {
        count: selectedItems.size,
        ids: Array.from(selectedItems),
      },
    });
  }

  return null; // This is a context provider, no UI
}
```

**Usage in `app/page.tsx`:**

```typescript
import { IntuneContext } from '@/components/copilot/IntuneContext';

export default function Page() {
  // ... existing state ...

  return (
    <CopilotSidebar ...>
      <IntuneContext
        allData={allData}
        activeTab={activeTab}
        selectedItems={selectedItems}
      />

      <div className="min-h-screen bg-gray-50">
        {/* ... existing JSX ... */}
      </div>
    </CopilotSidebar>
  );
}
```

#### Step 3.2: Add Actionable Functions

**File:** `components/copilot/IntuneActions.tsx` (NEW FILE)

```typescript
'use client';

import { useCopilotAction } from '@copilotkit/react-core';
import type { AllData, ResourceItem } from '@/lib/types';

interface IntuneActionsProps {
  allData: AllData;
  setActiveTab: (tab: 'profiles' | 'scripts' | 'compliance' | 'apps') => void;
  setSearchTerm: (term: string) => void;
  setPlatformFilter: (platform: string) => void;
  setSelectedItems: React.Dispatch<React.SetStateAction<Set<string>>>;
  onExportJSON: () => void;
  onExportHTML: () => void;
  onExportZIP: () => void;
}

export function IntuneActions({
  allData,
  setActiveTab,
  setSearchTerm,
  setPlatformFilter,
  setSelectedItems,
  onExportJSON,
  onExportHTML,
  onExportZIP,
}: IntuneActionsProps) {

  // Action: Switch tabs
  useCopilotAction({
    name: 'switchTab',
    description: 'Switch to a different resource tab (profiles, scripts, compliance, or apps)',
    parameters: [
      {
        name: 'tab',
        type: 'string',
        description: 'The tab to switch to',
        enum: ['profiles', 'scripts', 'compliance', 'apps'],
        required: true,
      },
    ],
    handler: async ({ tab }) => {
      setActiveTab(tab as any);
      return `Switched to ${tab} tab`;
    },
  });

  // Action: Search resources
  useCopilotAction({
    name: 'searchResources',
    description: 'Search for resources by name or description',
    parameters: [
      {
        name: 'query',
        type: 'string',
        description: 'The search query',
        required: true,
      },
    ],
    handler: async ({ query }) => {
      setSearchTerm(query);
      return `Searching for: ${query}`;
    },
  });

  // Action: Filter by platform
  useCopilotAction({
    name: 'filterByPlatform',
    description: 'Filter resources by platform (Windows, iOS, Android, macOS)',
    parameters: [
      {
        name: 'platform',
        type: 'string',
        description: 'The platform to filter by',
        enum: ['Windows', 'iOS', 'Android', 'macOS', ''],
        required: true,
      },
    ],
    handler: async ({ platform }) => {
      setPlatformFilter(platform);
      return platform ? `Filtered by ${platform}` : 'Cleared platform filter';
    },
  });

  // Action: Select items
  useCopilotAction({
    name: 'selectItems',
    description: 'Select specific items by their IDs for export',
    parameters: [
      {
        name: 'itemIds',
        type: 'string[]',
        description: 'Array of item IDs to select',
        required: true,
      },
    ],
    handler: async ({ itemIds }) => {
      setSelectedItems(new Set(itemIds));
      return `Selected ${itemIds.length} items`;
    },
  });

  // Action: Export as JSON
  useCopilotAction({
    name: 'exportJSON',
    description: 'Export the current selection as a JSON file',
    parameters: [],
    handler: async () => {
      onExportJSON();
      return 'Exported as JSON';
    },
  });

  // Action: Export as HTML
  useCopilotAction({
    name: 'exportHTML',
    description: 'Export the current selection as an HTML report',
    parameters: [],
    handler: async () => {
      onExportHTML();
      return 'Exported as HTML report';
    },
  });

  // Action: Export as ZIP
  useCopilotAction({
    name: 'exportZIP',
    description: 'Export the current selection as a ZIP archive with scripts and report',
    parameters: [],
    handler: async () => {
      onExportZIP();
      return 'Exported as ZIP archive';
    },
  });

  // Action: Get resource details
  useCopilotAction({
    name: 'getResourceDetails',
    description: 'Get detailed information about a specific resource by ID',
    parameters: [
      {
        name: 'resourceId',
        type: 'string',
        description: 'The ID of the resource to get details for',
        required: true,
      },
    ],
    handler: async ({ resourceId }) => {
      // Find the resource across all data types
      const resource =
        allData.profiles.find(p => p.id === resourceId) ||
        allData.scripts.find(s => s.id === resourceId) ||
        allData.compliance.find(c => c.id === resourceId) ||
        allData.apps.find(a => a.id === resourceId);

      if (!resource) {
        return `Resource with ID ${resourceId} not found`;
      }

      return JSON.stringify(resource, null, 2);
    },
  });

  return null; // This is an actions provider, no UI
}
```

**Usage in `app/page.tsx`:**

```typescript
import { IntuneActions } from '@/components/copilot/IntuneActions';

export default function Page() {
  // ... existing state and handlers ...

  return (
    <CopilotSidebar ...>
      <IntuneContext {...contextProps} />
      <IntuneActions
        allData={allData}
        setActiveTab={setActiveTab}
        setSearchTerm={setSearchTerm}
        setPlatformFilter={setPlatformFilter}
        setSelectedItems={setSelectedItems}
        onExportJSON={handleExportJSON}
        onExportHTML={handleExportHTML}
        onExportZIP={handleExportZIP}
      />

      <div className="min-h-screen bg-gray-50">
        {/* ... existing JSX ... */}
      </div>
    </CopilotSidebar>
  );
}
```

---

## Use Cases for IntuneHero

### 1. Natural Language Queries

**User:** "Show me all Windows compliance policies"

**Copilot Actions:**
1. Calls `switchTab({ tab: 'compliance' })`
2. Calls `filterByPlatform({ platform: 'Windows' })`
3. Responds: "I've switched to the compliance tab and filtered for Windows policies. You have X Windows compliance policies."

### 2. Smart Export Assistance

**User:** "Export all iOS profiles as a ZIP file"

**Copilot Actions:**
1. Calls `switchTab({ tab: 'profiles' })`
2. Calls `filterByPlatform({ platform: 'iOS' })`
3. Selects all iOS profiles via `selectItems({ itemIds: [...] })`
4. Calls `exportZIP()`
5. Responds: "I've exported all 5 iOS profiles as a ZIP file. The download should start shortly."

### 3. Configuration Analysis

**User:** "What are the most recent changes to my Intune configuration?"

**Copilot Response:**
- Analyzes `lastModifiedDateTime` across all resources
- Provides a summary: "Your 3 most recent changes are: [list with dates and names]"

### 4. Guided Onboarding

**User:** "How do I get started?"

**Copilot Response:**
- Provides step-by-step guidance
- Explains authentication
- Shows how to navigate tabs
- Demonstrates export features

### 5. Troubleshooting Assistance

**User:** "Why can't I see any data?"

**Copilot Diagnostic:**
- Checks authentication status
- Verifies data load state
- Suggests re-authentication or permission checks

---

## Configuration Options

### 1. CopilotKit Provider Options

```typescript
<CopilotKit
  runtimeUrl="/api/copilotkit"
  // Custom headers (e.g., for auth)
  headers={{ 'Authorization': 'Bearer ...' }}
  // Disable features
  enableTextToSpeech={false}
  // Custom public API key (for Copilot Cloud)
  publicApiKey="..."
>
```

### 2. UI Customization

```typescript
<CopilotSidebar
  defaultOpen={false}
  clickOutsideToClose={true}
  labels={{
    title: "IntuneHero Assistant",
    initial: "Welcome! How can I help?",
    placeholder: "Ask me anything...",
  }}
  icons={{
    // Custom icons
  }}
  // Custom styling
  className="custom-sidebar"
>
```

### 3. Model Selection

**Recommended Models for IntuneHero:**

| Model | Provider | Cost/1M tokens | Speed | Best For |
|-------|----------|---------------|-------|----------|
| gpt-4o-mini | OpenAI | $0.15/$0.60 | Fast | General queries, Phase 1 |
| gpt-4o | OpenAI | $2.50/$10 | Medium | Complex analysis |
| claude-3-5-haiku | Anthropic | $0.25/$1.25 | Very Fast | Quick responses |
| claude-3-5-sonnet | Anthropic | $3/$15 | Medium | Advanced reasoning |

**Recommendation:** Start with `gpt-4o-mini` for Phase 1 (cost-effective and fast).

---

## Security Considerations

### 1. API Key Protection

**NEVER expose API keys in client-side code:**

✅ Correct (server-side only):
```typescript
// app/api/copilotkit/route.ts
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Server-side env var
});
```

❌ Incorrect (security risk):
```typescript
// app/page.tsx (client component)
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, // ❌ Exposed to browser!
});
```

### 2. Prompt Injection Protection

CopilotKit includes built-in protection, but additional measures:

```typescript
// app/api/copilotkit/route.ts
const runtime = new CopilotRuntime({
  // Add request validation
  actions: [
    {
      name: 'validateRequest',
      handler: async (request) => {
        // Custom validation logic
        if (request.includes('ignore previous instructions')) {
          throw new Error('Invalid request');
        }
      },
    },
  ],
});
```

### 3. Data Privacy

**Be mindful of what data is sent to LLM providers:**

- Configuration names and descriptions: ✅ Generally safe
- Full configuration JSON: ⚠️ May contain sensitive settings
- User identities: ⚠️ Avoid sending personal data
- API tokens/secrets: ❌ NEVER send

**Sanitization Example:**

```typescript
useCopilotReadable({
  description: 'Intune profiles',
  value: allData.profiles.map(p => ({
    id: p.id,
    name: p.displayName,
    description: p.description,
    // ❌ DON'T include: full settings, tokens, user-specific data
  })),
});
```

### 4. Authentication Integration

**Optional: Require authentication before copilot access:**

```typescript
// app/api/copilotkit/route.ts
export const POST = async (req: NextRequest) => {
  // Check authentication
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !isValidToken(authHeader)) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Proceed with CopilotKit handling
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({...});
  return handleRequest(req);
};
```

### 5. Rate Limiting

**Implement rate limiting to prevent abuse:**

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
```

---

## Testing Strategy

### 1. Unit Tests

**Test CopilotKit actions:**

```typescript
// components/copilot/__tests__/IntuneActions.test.tsx
import { renderHook } from '@testing-library/react';
import { useCopilotAction } from '@copilotkit/react-core';

describe('IntuneActions', () => {
  it('should switch tabs correctly', async () => {
    const setActiveTab = jest.fn();

    // Test action handler
    const { result } = renderHook(() =>
      useCopilotAction({
        name: 'switchTab',
        handler: async ({ tab }) => {
          setActiveTab(tab);
          return `Switched to ${tab}`;
        },
      })
    );

    // Verify behavior
    expect(setActiveTab).toHaveBeenCalledWith('profiles');
  });
});
```

### 2. Integration Tests

**Test API route:**

```typescript
// app/api/copilotkit/__tests__/route.test.ts
import { POST } from '../route';

describe('CopilotKit API Route', () => {
  it('should handle POST requests', async () => {
    const req = new Request('http://localhost:3000/api/copilotkit', {
      method: 'POST',
      body: JSON.stringify({ message: 'Test' }),
    });

    const response = await POST(req as any);
    expect(response.status).toBe(200);
  });

  it('should reject unauthenticated requests', async () => {
    // Test authentication logic
  });
});
```

### 3. E2E Tests (Playwright)

```typescript
// tests/copilot.spec.ts
import { test, expect } from '@playwright/test';

test('CopilotKit sidebar opens and responds', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Click copilot trigger
  await page.click('[data-testid="copilot-trigger"]');

  // Wait for sidebar
  await expect(page.locator('[data-testid="copilot-sidebar"]')).toBeVisible();

  // Type a message
  await page.fill('[data-testid="copilot-input"]', 'Show me all profiles');
  await page.click('[data-testid="copilot-send"]');

  // Wait for response
  await expect(page.locator('[data-testid="copilot-message"]')).toContainText('profiles');
});
```

### 4. Manual Testing Checklist

- [ ] API route responds to POST requests
- [ ] Sidebar opens/closes correctly
- [ ] Actions execute and update UI
- [ ] Context updates when data changes
- [ ] Error handling works (e.g., API key missing)
- [ ] Rate limiting activates correctly
- [ ] Export actions trigger downloads
- [ ] Mobile responsive design
- [ ] Accessibility (keyboard navigation, screen readers)

---

## Troubleshooting

### Common Issues

#### 1. "Cannot GET /api/copilotkit"

**Cause:** Visiting the route in browser (GET request)

**Solution:** This is normal. The route only accepts POST requests. Test with:

```bash
curl -X POST http://localhost:3000/api/copilotkit \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}'
```

#### 2. "Output 'export' not supported with API routes"

**Cause:** `output: 'export'` still in `next.config.mjs`

**Solution:** Remove the line (see Step 1.1)

#### 3. "OpenAI API key not found"

**Cause:** Missing or incorrect environment variable

**Solution:**
1. Create `.env.local` with `OPENAI_API_KEY=sk-...`
2. Restart dev server: `npm run dev`
3. Verify: `console.log(process.env.OPENAI_API_KEY)` in API route

#### 4. CopilotKit styles not loading

**Cause:** Missing CSS import

**Solution:** Add to `app/layout.tsx`:
```typescript
import '@copilotkit/react-ui/styles.css';
```

#### 5. Actions not executing

**Cause:** Actions not properly registered or naming mismatch

**Debug:**
1. Check browser console for errors
2. Verify action names match between definition and call
3. Ensure actions are within CopilotKit provider

#### 6. Context not updating

**Cause:** `useCopilotReadable` dependencies not changing

**Solution:** Ensure context values change when data updates:
```typescript
useCopilotReadable({
  description: 'Current data',
  value: allData, // Should be reactive state
});
```

---

## Next Steps & Roadmap

### Phase 1: Basic Integration (Week 1-2)
- [x] Research and documentation
- [ ] Backend setup (API route)
- [ ] Frontend provider integration
- [ ] Basic sidebar UI
- [ ] Simple Q&A without actions

### Phase 2: Context & Actions (Week 3-4)
- [ ] Implement `useCopilotReadable` for Intune data
- [ ] Add basic actions (tab switching, search)
- [ ] Test with real data
- [ ] Gather user feedback

### Phase 3: Advanced Features (Week 5-8)
- [ ] Export actions integration
- [ ] Advanced filtering
- [ ] Configuration analysis
- [ ] Custom UI refinements
- [ ] Performance optimization

### Phase 4: Production Readiness (Week 9-12)
- [ ] Security audit
- [ ] Rate limiting implementation
- [ ] Error handling improvements
- [ ] Comprehensive testing
- [ ] Documentation for end users
- [ ] Deployment

### Future Enhancements
- LangGraph agent integration for multi-step workflows
- Custom generative UI for Intune-specific visualizations
- Voice interface (text-to-speech)
- Multi-language support
- Advanced analytics and insights

---

## Additional Resources

### Official Documentation
- CopilotKit Docs: https://docs.copilotkit.ai
- CopilotKit GitHub: https://github.com/CopilotKit/CopilotKit
- CopilotKit Examples: https://github.com/CopilotKit/CopilotKit/tree/main/examples

### Community & Support
- Discord: https://discord.gg/copilotkit
- GitHub Issues: https://github.com/CopilotKit/CopilotKit/issues
- Twitter: @copilotkit

### LLM Provider Documentation
- OpenAI API: https://platform.openai.com/docs
- Anthropic API: https://docs.anthropic.com
- Azure OpenAI: https://learn.microsoft.com/azure/ai-services/openai/

### Next.js & React
- Next.js App Router: https://nextjs.org/docs/app
- React Hooks: https://react.dev/reference/react

---

## Conclusion

CopilotKit provides a powerful, production-ready framework for adding AI capabilities to IntuneHero. The integration is straightforward and non-invasive, requiring minimal changes to the existing codebase:

**Required Changes:**
1. Switch from static export to hybrid mode (1 line in config)
2. Install 3 npm packages
3. Create 1 API route file (20-30 lines)
4. Wrap app in provider (5 lines in layout)
5. Add UI component (5-10 lines)

**Benefits:**
- Natural language interaction with Intune data
- Smart export assistance
- Enhanced user onboarding
- Reduced support burden
- Competitive differentiation

**Total Implementation Time:** 2-4 weeks for full Phase 1-2 integration

This guide provides everything needed to successfully integrate CopilotKit into IntuneHero's Phase 1 branch. Follow the steps sequentially, test thoroughly, and iterate based on user feedback.

---

**Document Version:** 1.0
**Last Updated:** 2025-01-13
**Author:** IntuneHero Development Team
