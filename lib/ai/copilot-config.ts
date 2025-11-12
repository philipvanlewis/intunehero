// CopilotKit Configuration for IntuneHero

import type { AIConfig, AIFeatureFlags } from './types';

/**
 * Get AI feature flags from environment variables
 */
export function getAIFeatureFlags(): AIFeatureFlags {
  return {
    enabled: process.env.NEXT_PUBLIC_AI_ENABLED !== 'false',
    searchEnabled: process.env.NEXT_PUBLIC_AI_SEARCH_ENABLED !== 'false',
    recommendationsEnabled: process.env.NEXT_PUBLIC_AI_RECOMMENDATIONS_ENABLED !== 'false',
    explainEnabled: true,
    compareEnabled: true,
    exportAssistantEnabled: true,
  };
}

/**
 * Get AI configuration
 */
export function getAIConfig(): AIConfig {
  const apiKey = process.env.OPENAI_API_KEY || '';
  const model = process.env.OPENAI_MODEL || 'gpt-4';

  if (!apiKey && typeof window === 'undefined') {
    console.warn('⚠️ OPENAI_API_KEY not configured. AI features will not work.');
  }

  return {
    apiKey,
    model,
    temperature: 0.7,
    maxTokens: 2000,
    features: getAIFeatureFlags(),
  };
}

/**
 * Get CopilotKit runtime URL
 */
export function getCopilotRuntimeURL(): string {
  return process.env.NEXT_PUBLIC_COPILOT_RUNTIME_URL || '/api/copilot';
}

/**
 * Check if AI features are enabled
 */
export function isAIEnabled(): boolean {
  const features = getAIFeatureFlags();
  return features.enabled;
}

/**
 * Azure OpenAI configuration (alternative to OpenAI)
 */
export function getAzureOpenAIConfig() {
  return {
    apiKey: process.env.AZURE_OPENAI_API_KEY || '',
    endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
    deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || '',
    apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview',
  };
}

/**
 * Check if using Azure OpenAI instead of OpenAI
 */
export function isUsingAzureOpenAI(): boolean {
  const azureConfig = getAzureOpenAIConfig();
  return !!(azureConfig.apiKey && azureConfig.endpoint && azureConfig.deploymentName);
}

/**
 * Get AI provider name for logging
 */
export function getAIProviderName(): string {
  return isUsingAzureOpenAI() ? 'Azure OpenAI' : 'OpenAI';
}

/**
 * CopilotKit labels and messages
 */
export const COPILOT_LABELS = {
  title: 'IntuneHero AI Assistant',
  placeholder: 'Ask me about your Intune configurations...',
  initial: "👋 Hi! I'm your IntuneHero AI assistant. I can help you search configurations, explain policies, recommend settings, and more. What would you like to know?",
  thinking: 'Thinking...',
  error: 'Sorry, I encountered an error. Please try again.',
};

/**
 * CopilotKit configuration options
 */
export const COPILOT_OPTIONS = {
  // Enable streaming responses
  stream: true,

  // Show thinking indicator
  showThinking: true,

  // Enable markdown rendering
  markdown: true,

  // Enable code highlighting
  codeHighlight: true,

  // Maximum context window (tokens)
  maxContext: 4000,

  // Timeout for AI responses (milliseconds)
  timeout: 30000,
};

/**
 * Rate limiting configuration
 */
export const RATE_LIMIT_CONFIG = {
  // Maximum requests per user per minute
  maxRequestsPerMinute: 10,

  // Maximum requests per user per hour
  maxRequestsPerHour: 100,

  // Cooldown period after rate limit (seconds)
  cooldownPeriod: 60,
};

/**
 * AI model configurations for different use cases
 */
export const AI_MODEL_CONFIGS = {
  // Fast responses for simple queries
  fast: {
    model: 'gpt-3.5-turbo',
    temperature: 0.5,
    maxTokens: 500,
  },

  // Balanced performance for most queries
  balanced: {
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 1500,
  },

  // High quality for complex analysis
  quality: {
    model: 'gpt-4-turbo-preview',
    temperature: 0.8,
    maxTokens: 3000,
  },
};

/**
 * Select appropriate model based on query type
 */
export function selectModelForQuery(queryType: 'search' | 'explain' | 'recommend' | 'compare' | 'export'): string {
  switch (queryType) {
    case 'search':
      return AI_MODEL_CONFIGS.fast.model;
    case 'explain':
    case 'export':
      return AI_MODEL_CONFIGS.balanced.model;
    case 'recommend':
    case 'compare':
      return AI_MODEL_CONFIGS.quality.model;
    default:
      return AI_MODEL_CONFIGS.balanced.model;
  }
}
