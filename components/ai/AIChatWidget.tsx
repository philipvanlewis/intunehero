'use client';

// AI Chat Widget Component for IntuneHero
// Provides a floating chat interface for AI assistance

import { CopilotPopup } from '@copilotkit/react-ui';
import { useCopilotAction, useCopilotReadable } from '@copilotkit/react-core';
import '@copilotkit/react-ui/styles.css';
import type { AllData } from '@/lib/types';
import { searchConfigurationsAction, explainConfigurationAction } from '@/lib/ai/actions';
import { serializeContextForAI, buildFullContext } from '@/lib/ai/context';
import { COPILOT_LABELS, isAIEnabled } from '@/lib/ai/copilot-config';
import { HELP_MESSAGE } from '@/lib/ai/prompts';

interface AIChatWidgetProps {
  allData: AllData;
  selectedItems: Set<string>;
  activeTab: 'profiles' | 'scripts' | 'compliance' | 'apps';
  searchTerm: string;
  platformFilter: string;
  currentUser: string;
}

export function AIChatWidget({
  allData,
  selectedItems,
  activeTab,
  searchTerm,
  platformFilter,
  currentUser,
}: AIChatWidgetProps) {
  // Check if AI is enabled
  if (!isAIEnabled()) {
    return null;
  }

  // Build context for AI
  const context = buildFullContext({
    user: currentUser,
    selectedItems,
    activeTab,
    searchTerm,
    platformFilter,
    allData,
  });

  // Make context readable to AI
  useCopilotReadable({
    description: 'Current dashboard state and available Intune configurations',
    value: serializeContextForAI(context),
  });

  // Register "search configurations" action
  useCopilotAction({
    name: 'search_configurations',
    description:
      'Search Intune configurations (profiles, scripts, compliance policies, apps) by natural language query',
    parameters: [
      {
        name: 'query',
        type: 'string',
        description: 'Natural language search query (e.g., "BitLocker encryption", "Windows security policies")',
        required: true,
      },
      {
        name: 'type',
        type: 'string',
        description: 'Type of configuration to search: profiles, scripts, compliance, apps, or all',
        enum: ['profiles', 'scripts', 'compliance', 'apps', 'all'],
      },
      {
        name: 'platform',
        type: 'string',
        description: 'Platform filter: Windows, iOS, Android, macOS',
        enum: ['Windows', 'iOS', 'Android', 'macOS'],
      },
    ],
    handler: async ({ query, type, platform }) => {
      console.log('[AI ACTION] search_configurations:', { query, type, platform });

      try {
        const result = await searchConfigurationsAction(
          { query, type, platform, limit: 10 },
          allData
        );

        if (!result.success) {
          return `❌ Search failed: ${result.error}`;
        }

        const { data: results, message } = result;

        if (!results || results.length === 0) {
          return `No configurations found matching "${query}". Try different keywords or remove filters.`;
        }

        // Format results for display
        const formattedResults = results
          .map((r, i) => {
            const item = r.item;
            const score = Math.round(r.relevanceScore);
            return `${i + 1}. **${item.displayName}** (${item.type}, relevance: ${score}%)\n   ${item.description || 'No description'}\n   ID: \`${item.id}\``;
          })
          .join('\n\n');

        return `
✅ ${message}

${formattedResults}

**Next steps:**
- Ask me to explain any configuration by name
- Request details about a specific item
- Compare multiple configurations
- Export selected items
        `.trim();
      } catch (error) {
        console.error('[AI ACTION] search_configurations error:', error);
        return `❌ An error occurred while searching: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    },
  });

  // Register "explain configuration" action
  useCopilotAction({
    name: 'explain_configuration',
    description: 'Explain what a configuration profile, script, or policy does in plain English',
    parameters: [
      {
        name: 'id',
        type: 'string',
        description: 'The ID of the configuration to explain',
        required: true,
      },
      {
        name: 'type',
        type: 'string',
        description: 'Type of configuration: profile, script, compliance, or app',
        enum: ['profile', 'script', 'compliance', 'app'],
        required: true,
      },
    ],
    handler: async ({ id, type }) => {
      console.log('[AI ACTION] explain_configuration:', { id, type });

      try {
        const result = await explainConfigurationAction({ id, type }, allData);

        if (!result.success) {
          return `❌ ${result.error}`;
        }

        const explanation = result.data!;

        return `
## ${result.message}

### 📋 Summary
${explanation.summary}

### 🎯 Purpose
${explanation.purpose}

### 💥 Impact
${explanation.impact}

### 📱 Affected Devices
${explanation.affectedDevices}

${explanation.relatedPolicies.length > 0 ? `### 🔗 Related Policies\n${explanation.relatedPolicies.join('\n')}` : ''}

${explanation.technicalDetails ? `### 🔧 Technical Details\n\`\`\`json\n${JSON.stringify(explanation.technicalDetails, null, 2)}\n\`\`\`` : ''}
        `.trim();
      } catch (error) {
        console.error('[AI ACTION] explain_configuration error:', error);
        return `❌ An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    },
  });

  // Register "help" action
  useCopilotAction({
    name: 'show_help',
    description: 'Show help message with examples of what the AI assistant can do',
    parameters: [],
    handler: async () => {
      return HELP_MESSAGE;
    },
  });

  return (
    <CopilotPopup
      labels={{
        title: COPILOT_LABELS.title,
        initial: COPILOT_LABELS.initial,
        placeholder: COPILOT_LABELS.placeholder,
      }}
      defaultOpen={false}
      clickOutsideToClose={true}
      className="intune-ai-chat"
    />
  );
}
