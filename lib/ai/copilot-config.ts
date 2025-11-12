/**
 * CopilotKit Configuration
 * Centralized configuration for AI features and behaviors
 */

import { AIFeatureFlags, AIModelConfig } from "./types";

/**
 * Feature flags for controlling AI functionality
 */
export const AI_FEATURE_FLAGS: AIFeatureFlags = {
  enabled: process.env.NEXT_PUBLIC_AI_ENABLED === "true",
  searchEnabled: process.env.NEXT_PUBLIC_AI_SEARCH_ENABLED !== "false",
  recommendationsEnabled: process.env.NEXT_PUBLIC_AI_RECOMMENDATIONS_ENABLED !== "false",
  explainEnabled: process.env.NEXT_PUBLIC_AI_EXPLAIN_ENABLED !== "false",
  compareEnabled: process.env.NEXT_PUBLIC_AI_COMPARE_ENABLED !== "false",
  exportEnabled: process.env.NEXT_PUBLIC_AI_EXPORT_ENABLED !== "false",
};

/**
 * AI Model Configuration
 */
export function getAIModelConfig(): AIModelConfig {
  const provider = process.env.NEXT_PUBLIC_AI_PROVIDER || "openai";

  if (provider === "azure-openai") {
    return {
      provider: "azure-openai",
      azureApiKey: process.env.AZURE_OPENAI_API_KEY,
      azureEndpoint: process.env.AZURE_OPENAI_ENDPOINT,
      azureDeploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
      azureApiVersion: process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview",
      temperature: parseFloat(process.env.NEXT_PUBLIC_AI_TEMPERATURE || "0.7"),
      maxTokens: parseInt(process.env.NEXT_PUBLIC_AI_MAX_TOKENS || "2000"),
    };
  }

  return {
    provider: "openai",
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.NEXT_PUBLIC_AI_MODEL || "gpt-4",
    temperature: parseFloat(process.env.NEXT_PUBLIC_AI_TEMPERATURE || "0.7"),
    maxTokens: parseInt(process.env.NEXT_PUBLIC_AI_MAX_TOKENS || "2000"),
  };
}

/**
 * Check if API is properly configured
 */
export function isAIConfigured(): boolean {
  const config = getAIModelConfig();

  if (config.provider === "azure-openai") {
    return !!(config.azureApiKey && config.azureEndpoint && config.azureDeploymentName);
  }

  return !!config.apiKey;
}

/**
 * AI Action Configuration
 * Defines available AI actions and their metadata
 */
export const AI_ACTIONS = {
  search: {
    name: "search_configurations",
    description: "Search for Intune configurations using natural language",
    enabled: AI_FEATURE_FLAGS.searchEnabled,
    icon: "search",
    category: "Discovery",
  },
  explain: {
    name: "explain_configuration",
    description: "Get a detailed explanation of what a configuration does",
    enabled: AI_FEATURE_FLAGS.explainEnabled,
    icon: "info",
    category: "Learning",
  },
  recommend: {
    name: "get_recommendations",
    description: "Get security and best practice recommendations",
    enabled: AI_FEATURE_FLAGS.recommendationsEnabled,
    icon: "lightbulb",
    category: "Optimization",
  },
  compare: {
    name: "compare_configurations",
    description: "Compare two or more configurations to understand differences",
    enabled: AI_FEATURE_FLAGS.compareEnabled,
    icon: "compare",
    category: "Analysis",
  },
  export: {
    name: "export_assistance",
    description: "Get help exporting and organizing configurations",
    enabled: AI_FEATURE_FLAGS.exportEnabled,
    icon: "download",
    category: "Operations",
  },
  help: {
    name: "show_help",
    description: "Get contextual help for your current task",
    enabled: true,
    icon: "help",
    category: "Support",
  },
};

/**
 * Get only enabled AI actions
 */
export function getEnabledActions() {
  return Object.values(AI_ACTIONS).filter((action) => action.enabled);
}

/**
 * Chat Widget Configuration
 */
export const CHAT_WIDGET_CONFIG = {
  position: "bottom-right" as const,
  width: 400,
  height: 600,
  minHeight: 300,
  collapsible: true,
  defaultOpen: false,
  theme: "light" as const,
  showBranding: true,
  showActions: true,
  showSuggestions: true,
};

/**
 * Context Configuration
 * Controls what data is shared with AI
 */
export const CONTEXT_CONFIG = {
  includeUserInfo: true,
  includeSelectedItems: true,
  includeCurrentTab: true,
  includeSearchTerm: true,
  includePlatformFilter: true,
  includeConfigurationSummary: true,
  maxConfigurationsInContext: 100,
  refreshContextOnAction: true,
};

/**
 * AI Response Configuration
 */
export const RESPONSE_CONFIG = {
  streamResponses: true,
  showThinkingProcess: false,
  includeSourceAttribution: true,
  formatAsMarkdown: true,
  maxResponseLength: 2000,
  citationStyle: "inline" as const,
};

/**
 * Error Handling Configuration
 */
export const ERROR_CONFIG = {
  retryAttempts: 3,
  retryDelay: 1000,
  showDetailedErrors: process.env.NODE_ENV === "development",
  fallbackToBasicSearch: true,
  gracefulDegradation: true,
};

/**
 * Rate Limiting Configuration
 */
export const RATE_LIMIT_CONFIG = {
  enabled: true,
  requestsPerMinute: 30,
  requestsPerHour: 500,
  burstLimit: 5,
};

/**
 * Security Configuration
 */
export const SECURITY_CONFIG = {
  validateInputs: true,
  sanitizeOutputs: true,
  enforceRateLimit: true,
  logSensitiveData: false,
  encryptContextData: false,
  requireAuthentication: false,
};

/**
 * Logging Configuration
 */
export const LOGGING_CONFIG = {
  enabled: process.env.NEXT_PUBLIC_AI_LOGGING === "true",
  logLevel: (process.env.NEXT_PUBLIC_AI_LOG_LEVEL || "info") as
    | "debug"
    | "info"
    | "warn"
    | "error",
  logToConsole: process.env.NODE_ENV === "development",
  logToServer: process.env.NEXT_PUBLIC_AI_LOGGING === "true",
  includeContextInLogs: process.env.NODE_ENV === "development",
};

/**
 * Behavior Configuration
 */
export const BEHAVIOR_CONFIG = {
  // Auto-dismiss chat after action
  autoDismissAfterAction: false,
  // Show confidence scores
  showConfidenceScores: false,
  // Suggest follow-up actions
  suggestFollowUps: true,
  // Enable learning from interactions
  enableLearning: false,
  // Cache responses
  cacheResponses: true,
  // Auto-refresh context
  autoRefreshContext: false,
  refreshContextInterval: 30000,
};

/**
 * Get all configuration as a serializable object
 */
export function getAllConfig() {
  return {
    features: AI_FEATURE_FLAGS,
    actions: AI_ACTIONS,
    chatWidget: CHAT_WIDGET_CONFIG,
    context: CONTEXT_CONFIG,
    response: RESPONSE_CONFIG,
    errors: ERROR_CONFIG,
    rateLimit: RATE_LIMIT_CONFIG,
    security: SECURITY_CONFIG,
    logging: LOGGING_CONFIG,
    behavior: BEHAVIOR_CONFIG,
    apiConfigured: isAIConfigured(),
  };
}

/**
 * Validate configuration
 */
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!isAIConfigured() && AI_FEATURE_FLAGS.enabled) {
    errors.push("AI is enabled but API is not configured");
  }

  if (CHAT_WIDGET_CONFIG.width < 300) {
    errors.push("Chat widget width must be at least 300px");
  }

  if (CHAT_WIDGET_CONFIG.height < CHAT_WIDGET_CONFIG.minHeight) {
    errors.push("Chat widget height cannot be less than minHeight");
  }

  if (RATE_LIMIT_CONFIG.requestsPerMinute < 1) {
    errors.push("Rate limit requestsPerMinute must be at least 1");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
