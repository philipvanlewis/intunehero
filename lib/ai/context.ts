/**
 * AI Context Management
 * Manages and serializes application context for AI awareness
 */

import { DashboardContext, ConfigurationItem, UserInfo } from "./types";

/**
 * Build context from current dashboard state
 * Used to make AI aware of what user is viewing
 */
export function buildDashboardContext(
  selectedItems: string[] = [],
  activeTab: string = "dashboard",
  searchTerm: string = "",
  platformFilter: string = "",
  configurations: ConfigurationItem[] = [],
  userInfo?: UserInfo
): DashboardContext {
  return {
    selectedItems,
    activeTab,
    searchTerm,
    platformFilter,
    configurations,
    userInfo,
  };
}

/**
 * Serialize context to a readable string for AI prompts
 */
export function serializeContextForAI(context: DashboardContext): string {
  const parts: string[] = [];

  // User info
  if (context.userInfo?.displayName) {
    parts.push(`User: ${context.userInfo.displayName}`);
  }

  // Current location
  parts.push(`Current View: ${context.activeTab}`);

  // Search context
  if (context.searchTerm) {
    parts.push(`Search: "${context.searchTerm}"`);
  }

  // Platform filter
  if (context.platformFilter) {
    parts.push(`Platform Filter: ${context.platformFilter}`);
  }

  // Selected items
  if (context.selectedItems.length > 0) {
    const selectedConfigs = context.configurations.filter((c) =>
      context.selectedItems.includes(c.id)
    );
    if (selectedConfigs.length > 0) {
      parts.push(`Selected Items: ${selectedConfigs.length}`);
      selectedConfigs.forEach((config) => {
        parts.push(`  - ${config.name} (${config.type}, ${config.platform})`);
      });
    }
  }

  // Available configurations summary
  if (context.configurations.length > 0) {
    const configsByType = groupConfigsByType(context.configurations);
    parts.push(`\nAvailable Configurations:`);
    Object.entries(configsByType).forEach(([type, count]) => {
      parts.push(`  ${type}: ${count}`);
    });

    const configsByPlatform = groupConfigsByPlatform(context.configurations);
    parts.push(`\nBy Platform:`);
    Object.entries(configsByPlatform).forEach(([platform, count]) => {
      parts.push(`  ${platform}: ${count}`);
    });
  }

  return parts.join("\n");
}

/**
 * Group configurations by type for summary
 */
function groupConfigsByType(configs: ConfigurationItem[]): Record<string, number> {
  return configs.reduce(
    (acc, config) => {
      acc[config.type] = (acc[config.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
}

/**
 * Group configurations by platform for summary
 */
function groupConfigsByPlatform(configs: ConfigurationItem[]): Record<string, number> {
  return configs.reduce(
    (acc, config) => {
      acc[config.platform] = (acc[config.platform] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
}

/**
 * Build context string for search action
 */
export function buildSearchContext(
  query: string,
  currentContext: DashboardContext
): string {
  const contextStr = serializeContextForAI(currentContext);
  return `Search Query: "${query}"\n\nCurrent Context:\n${contextStr}`;
}

/**
 * Build context string for explanation action
 */
export function buildExplanationContext(
  configId: string,
  currentContext: DashboardContext
): string {
  const config = currentContext.configurations.find((c) => c.id === configId);
  if (!config) {
    return `Configuration ID: ${configId}\n(Configuration details not available)`;
  }

  return `Configuration: ${config.name}
Type: ${config.type}
Platform: ${config.platform}
Description: ${config.description || "N/A"}
Priority: ${config.priority || "Standard"}
Last Modified: ${config.lastModified || "Unknown"}
`;
}

/**
 * Build context string for recommendation action
 */
export function buildRecommendationContext(
  configId: string | undefined,
  type: string | undefined,
  currentContext: DashboardContext
): string {
  const parts: string[] = ["Recommendation Request:"];

  if (configId) {
    const config = currentContext.configurations.find((c) => c.id === configId);
    if (config) {
      parts.push(`Configuration: ${config.name}`);
      parts.push(`Type: ${config.type}`);
      parts.push(`Platform: ${config.platform}`);
    }
  } else if (type) {
    parts.push(`Configuration Type: ${type}`);
  }

  parts.push("\nCurrent Environment Context:");
  parts.push(serializeContextForAI(currentContext));

  return parts.join("\n");
}

/**
 * Build context string for comparison action
 */
export function buildComparisonContext(
  ids: string[],
  currentContext: DashboardContext
): string {
  const configs = currentContext.configurations.filter((c) => ids.includes(c.id));

  const parts: string[] = ["Configuration Comparison:"];
  configs.forEach((config) => {
    parts.push(`\n${config.name}:`);
    parts.push(`  Type: ${config.type}`);
    parts.push(`  Platform: ${config.platform}`);
    parts.push(`  Description: ${config.description || "N/A"}`);
  });

  return parts.join("\n");
}

/**
 * Build context for export action
 */
export function buildExportContext(
  selectedIds: string[],
  format: string | undefined,
  currentContext: DashboardContext
): string {
  const configs = currentContext.configurations.filter((c) =>
    selectedIds.includes(c.id)
  );

  const parts: string[] = ["Export Assistance:"];
  parts.push(`Format: ${format || "Not specified"}`);
  parts.push(`Items to export: ${configs.length}`);

  if (configs.length > 0) {
    parts.push("\nSelected configurations:");
    configs.forEach((config) => {
      parts.push(`  - ${config.name} (${config.type})`);
    });
  }

  return parts.join("\n");
}

/**
 * Get relevant configurations for current context
 */
export function getRelevantConfigurations(
  context: DashboardContext,
  limit: number = 5
): ConfigurationItem[] {
  let filtered = context.configurations;

  // Apply platform filter
  if (context.platformFilter) {
    filtered = filtered.filter((c) => c.platform === context.platformFilter);
  }

  // Prioritize selected items
  const selected = filtered.filter((c) => context.selectedItems.includes(c.id));
  const notSelected = filtered.filter((c) => !context.selectedItems.includes(c.id));

  return [...selected, ...notSelected].slice(0, limit);
}

/**
 * Build a summary string of the current context
 */
export function buildContextSummary(context: DashboardContext): string {
  const parts: string[] = [];

  if (context.selectedItems.length > 0) {
    parts.push(`${context.selectedItems.length} item(s) selected`);
  }

  if (context.searchTerm) {
    parts.push(`Searching: "${context.searchTerm}"`);
  }

  if (context.platformFilter) {
    parts.push(`Platform: ${context.platformFilter}`);
  }

  if (parts.length === 0) {
    parts.push("Viewing all configurations");
  }

  return parts.join(" • ");
}

/**
 * Extract metadata about configurations for AI
 */
export function extractConfigurationMetadata(
  configs: ConfigurationItem[]
): Record<string, unknown> {
  return {
    total: configs.length,
    byType: groupConfigsByType(configs),
    byPlatform: groupConfigsByPlatform(configs),
    withPriority: {
      critical: configs.filter((c) => c.priority === "high").length,
      medium: configs.filter((c) => c.priority === "medium").length,
      low: configs.filter((c) => c.priority === "low").length,
    },
    recentlyModified: configs
      .filter((c) => c.lastModified)
      .sort((a, b) => {
        const dateA = new Date(a.lastModified || 0).getTime();
        const dateB = new Date(b.lastModified || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 5)
      .map((c) => ({ name: c.name, date: c.lastModified })),
  };
}

/**
 * Build a rich context object for AI operations
 */
export function buildRichAIContext(
  dashboardContext: DashboardContext,
  action: string,
  params?: Record<string, unknown>
): {
  action: string;
  context: string;
  metadata: Record<string, unknown>;
  params?: Record<string, unknown>;
} {
  return {
    action,
    context: serializeContextForAI(dashboardContext),
    metadata: extractConfigurationMetadata(dashboardContext.configurations),
    params,
  };
}
