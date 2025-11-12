// AI Context Builders for IntuneHero
// These functions build contextual information to send to the AI

import type { AllData, ResourceItem } from '../types';
import type { AIContext } from './types';

/**
 * Build user context for AI
 * Provides information about what the user is currently viewing/doing
 */
export function buildUserContext(state: {
  user: string;
  selectedItems: Set<string>;
  activeTab: 'profiles' | 'scripts' | 'compliance' | 'apps';
  searchTerm: string;
  platformFilter: string;
}): string {
  const selectedCount = state.selectedItems.size;
  const selectedList = selectedCount > 0
    ? Array.from(state.selectedItems).slice(0, 5).join(', ') +
      (selectedCount > 5 ? `, and ${selectedCount - 5} more` : '')
    : 'none';

  return `
**Current User Context:**
- User: ${state.user}
- Active Tab: ${state.activeTab}
- Selected Items: ${selectedCount} (${selectedList})
- Active Search: ${state.searchTerm || 'none'}
- Platform Filter: ${state.platformFilter || 'all platforms'}
  `.trim();
}

/**
 * Build configuration context for AI
 * Provides overview of available configurations
 */
export function buildConfigurationContext(
  allData: AllData,
  activeTab: 'profiles' | 'scripts' | 'compliance' | 'apps'
): string {
  const counts = {
    profiles: allData.profiles.length,
    scripts: allData.scripts.length,
    compliance: allData.compliance.length,
    apps: allData.apps.length,
  };

  const total = counts.profiles + counts.scripts + counts.compliance + counts.apps;

  // Sample a few items from each category for context
  const sampleProfiles = allData.profiles.slice(0, 3).map(p => p.displayName).join(', ');
  const sampleScripts = allData.scripts.slice(0, 3).map(s => s.displayName).join(', ');

  return `
**Available Intune Configurations:**
- Configuration Profiles: ${counts.profiles}${sampleProfiles ? ` (e.g., ${sampleProfiles})` : ''}
- PowerShell Scripts: ${counts.scripts}${sampleScripts ? ` (e.g., ${sampleScripts})` : ''}
- Compliance Policies: ${counts.compliance}
- Mobile Apps: ${counts.apps}
- Total: ${total} configurations

**Currently Viewing:** ${activeTab} tab
  `.trim();
}

/**
 * Build detailed item context
 * Provides full details about a specific configuration item
 */
export function buildItemContext(item: ResourceItem): string {
  if (item.type === 'profile') {
    return `
**Configuration Profile:**
- Name: ${item.displayName}
- Description: ${item.description || 'No description'}
- Platform: ${item.platforms}
- Last Modified: ${new Date(item.lastModifiedDateTime).toLocaleDateString()}
- Created: ${new Date(item.createdDateTime).toLocaleDateString()}
- Profile Type: ${item.profileType || 'N/A'}
- Settings: ${item.settings?.length || 0} settings configured
    `.trim();
  }

  if (item.type === 'script') {
    const scriptLength = item.scriptContent?.length || 0;
    const scriptPreview = item.scriptContent
      ? item.scriptContent.slice(0, 200) + (scriptLength > 200 ? '...' : '')
      : 'No content available';

    return `
**PowerShell Script:**
- Name: ${item.displayName}
- Description: ${item.description || 'No description'}
- Execution Context: ${item.executionContext || 'N/A'}
- Run As Account: ${item.runAsAccount || 'N/A'}
- Last Modified: ${item.lastModifiedDateTime ? new Date(item.lastModifiedDateTime).toLocaleDateString() : 'N/A'}
- Created: ${new Date(item.createdDateTime).toLocaleDateString()}
- Script Size: ${scriptLength} characters
- Script Preview: ${scriptPreview}
    `.trim();
  }

  if (item.type === 'compliance') {
    return `
**Compliance Policy:**
- Name: ${item.displayName}
- Description: ${item.description || 'No description'}
- Type: ${item['@odata.type']}
- Last Modified: ${new Date(item.lastModifiedDateTime).toLocaleDateString()}
- Created: ${new Date(item.createdDateTime).toLocaleDateString()}
    `.trim();
  }

  if (item.type === 'app') {
    return `
**Mobile Application:**
- Name: ${item.displayName}
- Description: ${item.description || 'No description'}
- Publisher: ${item.publisher || 'Unknown'}
- Type: ${item['@odata.type']}
- Published: ${item.publishedDateTime ? new Date(item.publishedDateTime).toLocaleDateString() : 'N/A'}
- Created: ${new Date(item.createdDateTime).toLocaleDateString()}
    `.trim();
  }

  return `Unknown item type: ${JSON.stringify(item)}`;
}

/**
 * Build comparison context
 * Provides context for comparing multiple items
 */
export function buildComparisonContext(items: ResourceItem[]): string {
  if (items.length === 0) {
    return 'No items to compare.';
  }

  const itemSummaries = items.map((item, index) => {
    return `
**Item ${index + 1}:**
${buildItemContext(item)}
    `.trim();
  }).join('\n\n---\n\n');

  return `
**Comparing ${items.length} Configurations:**

${itemSummaries}
  `.trim();
}

/**
 * Build search context
 * Provides context for search operations
 */
export function buildSearchContext(params: {
  query: string;
  type?: string;
  platform?: string;
  allData: AllData;
}): string {
  const { query, type, platform, allData } = params;

  return `
**Search Request:**
- Query: "${query}"
- Type Filter: ${type || 'all types'}
- Platform Filter: ${platform || 'all platforms'}

${buildConfigurationContext(allData, 'profiles')}
  `.trim();
}

/**
 * Build full AI context
 * Combines all context types into a comprehensive context object
 */
export function buildFullContext(state: {
  user: string;
  selectedItems: Set<string>;
  activeTab: 'profiles' | 'scripts' | 'compliance' | 'apps';
  searchTerm: string;
  platformFilter: string;
  allData: AllData;
}): AIContext {
  return {
    user: state.user,
    activeTab: state.activeTab,
    selectedItems: Array.from(state.selectedItems),
    searchTerm: state.searchTerm,
    platformFilter: state.platformFilter,
    allData: state.allData,
  };
}

/**
 * Serialize context for AI (text format)
 * Converts context object to text suitable for AI consumption
 */
export function serializeContextForAI(context: AIContext): string {
  const userContext = buildUserContext({
    user: context.user,
    selectedItems: new Set(context.selectedItems),
    activeTab: context.activeTab,
    searchTerm: context.searchTerm,
    platformFilter: context.platformFilter,
  });

  const configContext = buildConfigurationContext(
    context.allData,
    context.activeTab
  );

  return `
${userContext}

${configContext}
  `.trim();
}

/**
 * Filter sensitive data from context
 * Removes potentially sensitive information before sending to AI
 */
export function filterSensitiveContext(allData: AllData): AllData {
  // Helper to redact sensitive patterns
  const redactSensitive = (text: string | undefined): string | undefined => {
    if (!text) return text;

    return text
      // Redact email addresses
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL_REDACTED]')
      // Redact potential API keys
      .replace(/\b[A-Za-z0-9]{32,}\b/g, '[KEY_REDACTED]')
      // Redact potential passwords
      .replace(/password[:\s=]+[^\s]+/gi, 'password: [REDACTED]')
      // Redact potential secrets
      .replace(/secret[:\s=]+[^\s]+/gi, 'secret: [REDACTED]');
  };

  return {
    profiles: allData.profiles.map(p => ({
      ...p,
      description: redactSensitive(p.description),
    })),
    scripts: allData.scripts.map(s => ({
      ...s,
      description: redactSensitive(s.description),
      // Don't send full script content to AI - it may contain secrets
      scriptContent: '[Script content omitted for security]',
    })),
    compliance: allData.compliance.map(c => ({
      ...c,
      description: redactSensitive(c.description),
    })),
    apps: allData.apps.map(a => ({
      ...a,
      description: redactSensitive(a.description),
    })),
  };
}

/**
 * Get relevant items for context
 * Returns a subset of items relevant to the current context
 * (to avoid sending too much data to AI)
 */
export function getRelevantItems(
  allData: AllData,
  activeTab: 'profiles' | 'scripts' | 'compliance' | 'apps',
  limit: number = 10
): ResourceItem[] {
  const tabMap = {
    profiles: allData.profiles,
    scripts: allData.scripts,
    compliance: allData.compliance,
    apps: allData.apps,
  };

  return tabMap[activeTab].slice(0, limit);
}
