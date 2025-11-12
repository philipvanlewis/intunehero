// AI-specific TypeScript types for IntuneHero

import type { ResourceItem, AllData } from '../types';

/**
 * AI Action Types
 */
export type AIActionType =
  | 'search_configurations'
  | 'explain_configuration'
  | 'recommend_settings'
  | 'compare_configurations'
  | 'export_assistant';

/**
 * AI Intent Types (parsed from user queries)
 */
export type AIIntent =
  | 'search'
  | 'explain'
  | 'compare'
  | 'recommend'
  | 'export'
  | 'help'
  | 'unknown';

/**
 * AI Message Role
 */
export type AIMessageRole = 'user' | 'assistant' | 'system';

/**
 * AI Message
 */
export interface AIMessage {
  id: string;
  role: AIMessageRole;
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * AI Action Parameters
 */
export interface SearchConfigurationsParams {
  query: string;
  type?: 'profiles' | 'scripts' | 'compliance' | 'apps' | 'all';
  platform?: string;
  limit?: number;
}

export interface ExplainConfigurationParams {
  id: string;
  type: 'profile' | 'script' | 'compliance' | 'app';
}

export interface RecommendSettingsParams {
  scenario: string;
  platform?: 'Windows' | 'iOS' | 'Android' | 'macOS';
  securityLevel?: 'basic' | 'enhanced' | 'strict';
}

export interface CompareConfigurationsParams {
  ids: string[];
}

export interface ExportAssistantParams {
  ids: string[];
  format: 'json' | 'html' | 'zip';
  includeScripts?: boolean;
}

/**
 * AI Action Result
 */
export interface AIActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  suggestions?: string[];
}

/**
 * Search Result with Relevance Score
 */
export interface SearchResult {
  item: ResourceItem;
  relevanceScore: number;
  matchedFields: string[];
  highlights?: Record<string, string>;
}

/**
 * Configuration Explanation
 */
export interface ConfigurationExplanation {
  summary: string;
  purpose: string;
  impact: string;
  affectedDevices: string;
  relatedPolicies: string[];
  technicalDetails?: Record<string, any>;
}

/**
 * Best Practice Recommendation
 */
export interface BestPracticeRecommendation {
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  learnMoreUrl?: string;
}

/**
 * Best Practice Analysis
 */
export interface BestPracticeAnalysis {
  score: number; // 0-100
  recommendations: BestPracticeRecommendation[];
  compliantWith: string[]; // e.g., ['CIS', 'NIST', 'HIPAA']
  summary: string;
}

/**
 * Configuration Comparison
 */
export interface ConfigurationComparison {
  configurations: ResourceItem[];
  differences: Array<{
    field: string;
    values: Record<string, any>;
  }>;
  similarities: string[];
  summary: string;
}

/**
 * AI Context
 */
export interface AIContext {
  user: string;
  activeTab: 'profiles' | 'scripts' | 'compliance' | 'apps';
  selectedItems: string[];
  searchTerm: string;
  platformFilter: string;
  allData: AllData;
}

/**
 * AI Quick Action
 */
export interface AIQuickAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  action: () => void | Promise<void>;
}

/**
 * AI Suggestion
 */
export interface AISuggestion {
  id: string;
  title: string;
  description: string;
  confidence: number; // 0-1
  action?: AIQuickAction;
}

/**
 * Parsed Natural Language Query
 */
export interface ParsedQuery {
  intent: AIIntent;
  entities: string[];
  filters: {
    type?: 'profiles' | 'scripts' | 'compliance' | 'apps';
    platform?: string;
    dateRange?: [Date, Date];
  };
  originalQuery: string;
}

/**
 * AI Chat State
 */
export interface AIChatState {
  isOpen: boolean;
  messages: AIMessage[];
  isLoading: boolean;
  error?: string;
  context?: AIContext;
}

/**
 * AI Feature Flags
 */
export interface AIFeatureFlags {
  enabled: boolean;
  searchEnabled: boolean;
  recommendationsEnabled: boolean;
  explainEnabled: boolean;
  compareEnabled: boolean;
  exportAssistantEnabled: boolean;
}

/**
 * AI Configuration
 */
export interface AIConfig {
  apiKey: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  features: AIFeatureFlags;
}

/**
 * AI Audit Log Entry
 */
export interface AIAuditLog {
  id: string;
  timestamp: Date;
  user: string;
  action: AIActionType;
  query: string;
  result: 'success' | 'error';
  error?: string;
  metadata?: Record<string, any>;
}
