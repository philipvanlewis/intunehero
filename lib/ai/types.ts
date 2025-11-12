/**
 * AI Framework Type Definitions
 * Core TypeScript interfaces for the CopilotKit AI system
 */

// AI Action Types
export interface AIAction {
  name: string;
  description: string;
  parameters?: Record<string, unknown>;
}

export interface SearchConfiguration {
  query: string;
  type?: string;
  platform?: string;
}

export interface ConfigurationExplanation {
  configId: string;
  name?: string;
  type?: string;
}

export interface ExportAssistance {
  selectedIds: string[];
  format?: "json" | "csv" | "html";
  includeMetadata?: boolean;
}

export interface ComparisonRequest {
  ids: string[];
  compareFields?: string[];
}

export interface RecommendationRequest {
  configId?: string;
  type?: string;
  platform?: string;
}

// Context Types
export interface DashboardContext {
  selectedItems: string[];
  activeTab: string;
  searchTerm: string;
  platformFilter: string;
  configurations: ConfigurationItem[];
  userInfo?: UserInfo;
}

export interface ConfigurationItem {
  id: string;
  name: string;
  type: string;
  platform: string;
  description?: string;
  priority?: "high" | "medium" | "low";
  lastModified?: string;
  deviceCount?: number;
}

export interface UserInfo {
  id?: string;
  displayName?: string;
  email?: string;
}

// AI Response Types
export interface AISearchResult {
  id: string;
  name: string;
  type: string;
  platform?: string;
  relevance: number;
  excerpt?: string;
}

export interface AIExplanation {
  summary: string;
  details: string[];
  impact?: string;
  affectedDevices?: number;
}

export interface AIRecommendation {
  type: "security" | "compliance" | "performance" | "best-practice";
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  action?: string;
}

export interface AIComparison {
  items: ComparisonItem[];
  differences: string[];
  similarities: string[];
  recommendations?: string[];
}

export interface ComparisonItem {
  id: string;
  name: string;
  properties: Record<string, unknown>;
}

// Feature Flags
export interface AIFeatureFlags {
  enabled: boolean;
  searchEnabled: boolean;
  recommendationsEnabled: boolean;
  explainEnabled: boolean;
  compareEnabled: boolean;
  exportEnabled: boolean;
}

// Copilot Action State
export interface CopilotActionState {
  isLoading: boolean;
  error: string | null;
  result: unknown | null;
}

// Message Types for Chat
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  actionName?: string;
  actionResult?: unknown;
}

export interface ChatContext {
  messages: ChatMessage[];
  contextData: DashboardContext;
  threadId?: string;
}

// Configuration Metadata
export interface ConfigurationMetadata {
  id: string;
  name: string;
  type: string;
  platform: string;
  description: string;
  createdDate: string;
  lastModifiedDate: string;
  createdBy?: string;
  modifiedBy?: string;
  deviceCount?: number;
  priority?: string;
  tags?: string[];
  assignmentCount?: number;
  deploymentStatus?: "success" | "pending" | "failed" | "unknown";
}

// AI Model Configuration
export interface AIModelConfig {
  provider: "openai" | "azure-openai";
  apiKey?: string;
  azureApiKey?: string;
  azureEndpoint?: string;
  azureDeploymentName?: string;
  azureApiVersion?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

// Semantic Search Types
export interface SemanticSearchQuery {
  query: string;
  filters?: {
    type?: string[];
    platform?: string[];
    priority?: string[];
  };
  limit?: number;
}

export interface SemanticSearchResult {
  id: string;
  name: string;
  type: string;
  platform: string;
  score: number;
  explanation: string;
}

// Best Practice Analysis
export interface BestPracticeAnalysis {
  configId: string;
  framework: "cis" | "nist" | "microsoft-best-practices";
  findings: BestPracticeFinding[];
  overallScore: number;
  recommendations: string[];
}

export interface BestPracticeFinding {
  id: string;
  category: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  description: string;
  recommendation: string;
}

// Quick Action Types
export interface QuickAction {
  id: string;
  label: string;
  description: string;
  action: string;
  params?: Record<string, unknown>;
  context?: "selection" | "current-view" | "search-results";
}

// Error Response
export interface AIErrorResponse {
  error: true;
  message: string;
  code?: string;
  details?: unknown;
}

// Success Response
export interface AISuccessResponse<T> {
  error: false;
  data: T;
  timestamp: number;
}

export type AIResponse<T> = AISuccessResponse<T> | AIErrorResponse;
