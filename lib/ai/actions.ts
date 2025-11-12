/**
 * AI Action Implementations
 * Implements the actual logic for AI actions
 */

import {
  AISearchResult,
  AIExplanation,
  AIRecommendation,
  AIComparison,
  ComparisonRequest,
  SearchConfiguration,
  ConfigurationExplanation,
  RecommendationRequest,
  DashboardContext,
  ConfigurationItem,
} from "./types";
import {
  buildSearchContext,
  buildExplanationContext,
  buildRecommendationContext,
  buildComparisonContext,
} from "./context";

/**
 * Action: Search Configurations
 * Performs semantic search across all configurations
 */
export async function searchConfigurations(
  query: string,
  context: DashboardContext
): Promise<AISearchResult[]> {
  try {
    // Log the search
    console.log("[AI] Searching for:", query);

    // Build the search context for the AI
    const searchContext = buildSearchContext(query, context);

    // Call the backend API
    const response = await fetch("/api/copilot/actions/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        context: searchContext,
        configs: context.configurations,
      }),
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("[AI] Search error:", error);
    // Fallback: Simple string matching
    return fallbackSearch(query, context.configurations);
  }
}

/**
 * Action: Explain Configuration
 * Provides detailed explanation of what a configuration does
 */
export async function explainConfiguration(
  configId: string,
  context: DashboardContext
): Promise<AIExplanation> {
  try {
    console.log("[AI] Explaining configuration:", configId);

    const config = context.configurations.find((c) => c.id === configId);
    if (!config) {
      throw new Error("Configuration not found");
    }

    const explanationContext = buildExplanationContext(configId, context);

    const response = await fetch("/api/copilot/actions/explain", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        configId,
        config,
        context: explanationContext,
      }),
    });

    if (!response.ok) {
      throw new Error(`Explain failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.explanation || getBasicExplanation(config);
  } catch (error) {
    console.error("[AI] Explain error:", error);
    return getBasicExplanation(
      context.configurations.find((c) => c.id === configId)
    );
  }
}

/**
 * Action: Get Recommendations
 * Provides security and best practice recommendations
 */
export async function getRecommendations(
  configId: string | undefined,
  type: string | undefined,
  context: DashboardContext
): Promise<AIRecommendation[]> {
  try {
    console.log("[AI] Getting recommendations for:", configId || type);

    const recommendationContext = buildRecommendationContext(
      configId,
      type,
      context
    );

    const response = await fetch("/api/copilot/actions/recommend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        configId,
        type,
        context: recommendationContext,
        configs: context.configurations,
      }),
    });

    if (!response.ok) {
      throw new Error(`Recommendation failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.recommendations || [];
  } catch (error) {
    console.error("[AI] Recommendation error:", error);
    return [];
  }
}

/**
 * Action: Compare Configurations
 * Compares two or more configurations
 */
export async function compareConfigurations(
  ids: string[],
  context: DashboardContext
): Promise<AIComparison> {
  try {
    console.log("[AI] Comparing configurations:", ids);

    const configs = context.configurations.filter((c) => ids.includes(c.id));
    if (configs.length < 2) {
      throw new Error("At least 2 configurations are required for comparison");
    }

    const comparisonContext = buildComparisonContext(ids, context);

    const response = await fetch("/api/copilot/actions/compare", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ids,
        configs,
        context: comparisonContext,
      }),
    });

    if (!response.ok) {
      throw new Error(`Comparison failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.comparison || {};
  } catch (error) {
    console.error("[AI] Comparison error:", error);
    return {
      items: [],
      differences: [],
      similarities: [],
    };
  }
}

/**
 * Action: Export Assistance
 * Helps users export and organize configurations
 */
export async function getExportAssistance(
  selectedIds: string[],
  format: string | undefined,
  context: DashboardContext
): Promise<{ suggestions: string[]; format: string; notes: string[] }> {
  try {
    console.log("[AI] Getting export assistance");

    const selectedConfigs = context.configurations.filter((c) =>
      selectedIds.includes(c.id)
    );

    const response = await fetch("/api/copilot/actions/export-assist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        selectedIds,
        format,
        configs: selectedConfigs,
        totalConfigs: context.configurations.length,
      }),
    });

    if (!response.ok) {
      throw new Error(`Export assistance failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.assistance || { suggestions: [], format: "json", notes: [] };
  } catch (error) {
    console.error("[AI] Export assistance error:", error);
    return {
      suggestions: ["Export as JSON for backup", "Include metadata for documentation"],
      format: "json",
      notes: [],
    };
  }
}

/**
 * Fallback: Simple search when AI is unavailable
 */
function fallbackSearch(query: string, configs: ConfigurationItem[]): AISearchResult[] {
  const lowerQuery = query.toLowerCase();

  return configs
    .filter((config) => {
      const name = config.name.toLowerCase();
      const type = config.type.toLowerCase();
      const desc = (config.description || "").toLowerCase();

      return name.includes(lowerQuery) || type.includes(lowerQuery) || desc.includes(lowerQuery);
    })
    .slice(0, 5)
    .map((config) => ({
      id: config.id,
      name: config.name,
      type: config.type,
      relevance: query.length > 0 ? 0.7 : 0,
      excerpt: config.description,
    }));
}

/**
 * Fallback: Basic explanation when AI is unavailable
 */
function getBasicExplanation(config: ConfigurationItem | undefined): AIExplanation {
  if (!config) {
    return {
      summary: "Configuration not found",
      details: [],
    };
  }

  return {
    summary: config.description || `This is a ${config.type} for ${config.platform}`,
    details: [
      `Type: ${config.type}`,
      `Platform: ${config.platform}`,
      `Last Modified: ${config.lastModified || "Unknown"}`,
    ],
    impact: "Apply this configuration to manage device settings",
  };
}

/**
 * Format search results for display
 */
export function formatSearchResults(results: AISearchResult[]): string {
  if (results.length === 0) {
    return "No configurations found matching your search.";
  }

  const items = results
    .map(
      (r) => `
**${r.name}** (${r.type} - ${r.platform})
${r.excerpt ? `_${r.excerpt}_` : ""}
`
    )
    .join("\n");

  return `Found ${results.length} matching configuration(s):\n${items}`;
}

/**
 * Format explanation for display
 */
export function formatExplanation(explanation: AIExplanation): string {
  const parts: string[] = [explanation.summary];

  if (explanation.details && explanation.details.length > 0) {
    parts.push("\n**Details:**");
    explanation.details.forEach((detail) => {
      parts.push(`- ${detail}`);
    });
  }

  if (explanation.impact) {
    parts.push(`\n**Impact:** ${explanation.impact}`);
  }

  if (explanation.affectedDevices) {
    parts.push(`**Affected Devices:** ${explanation.affectedDevices}`);
  }

  return parts.join("\n");
}

/**
 * Format recommendations for display
 */
export function formatRecommendations(recommendations: AIRecommendation[]): string {
  if (recommendations.length === 0) {
    return "No recommendations available at this time.";
  }

  const items = recommendations
    .map(
      (r) => `
**[${r.priority.toUpperCase()}] ${r.title}**
${r.description}
${r.action ? `_Action: ${r.action}_` : ""}
`
    )
    .join("\n");

  return `Here are my recommendations:\n${items}`;
}

/**
 * Format comparison for display
 */
export function formatComparison(comparison: AIComparison): string {
  const parts: string[] = [];

  if (comparison.items && comparison.items.length > 0) {
    parts.push("**Configurations Being Compared:**");
    comparison.items.forEach((item) => {
      parts.push(`- ${item.name}`);
    });
  }

  if (comparison.differences && comparison.differences.length > 0) {
    parts.push("\n**Key Differences:**");
    comparison.differences.forEach((diff) => {
      parts.push(`- ${diff}`);
    });
  }

  if (comparison.similarities && comparison.similarities.length > 0) {
    parts.push("\n**Similarities:**");
    comparison.similarities.forEach((sim) => {
      parts.push(`- ${sim}`);
    });
  }

  if (comparison.recommendations && comparison.recommendations.length > 0) {
    parts.push("\n**Recommendations:**");
    comparison.recommendations.forEach((rec) => {
      parts.push(`- ${rec}`);
    });
  }

  return parts.join("\n");
}

/**
 * Validate action parameters
 */
export function validateActionParams(
  action: string,
  params: Record<string, unknown>
): { valid: boolean; error?: string } {
  switch (action) {
    case "search_configurations":
      if (!params.query || typeof params.query !== "string") {
        return { valid: false, error: "Query is required and must be a string" };
      }
      break;

    case "explain_configuration":
      if (!params.configId || typeof params.configId !== "string") {
        return { valid: false, error: "Configuration ID is required" };
      }
      break;

    case "compare_configurations":
      if (!Array.isArray(params.ids) || params.ids.length < 2) {
        return { valid: false, error: "At least 2 configuration IDs are required" };
      }
      break;

    case "export_assistance":
      if (!Array.isArray(params.selectedIds)) {
        return { valid: false, error: "Selected IDs array is required" };
      }
      break;

    default:
      break;
  }

  return { valid: true };
}
