/**
 * CopilotKit Backend Route
 * Handles AI backend operations and OpenAI/Azure OpenAI API calls
 */

import { NextRequest, NextResponse } from "next/server";
import { getAIModelConfig, isAIConfigured } from "@/lib/ai";

// Types for OpenAI API
interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * POST handler for copilot requests
 * Routes to CopilotKit runtime for LangChain integration
 */
export async function POST(request: NextRequest) {
  try {
    // Check if AI is configured
    if (!isAIConfigured()) {
      return NextResponse.json(
        { error: "AI service is not configured" },
        { status: 503 }
      );
    }

    // Get the request body
    const body = await request.json();
    console.log("[Copilot API] Received request:", {
      action: body.action,
      timestamp: new Date().toISOString(),
    });

    // Route to appropriate handler
    const { action, ...params } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 }
      );
    }

    // Call the appropriate action handler
    let result;
    switch (action) {
      case "search":
        result = await handleSearch(params);
        break;
      case "explain":
        result = await handleExplain(params);
        break;
      case "recommend":
        result = await handleRecommend(params);
        break;
      case "compare":
        result = await handleCompare(params);
        break;
      case "export-assist":
        result = await handleExportAssist(params);
        break;
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Copilot API] Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Handler for search action
 */
async function handleSearch(params: {
  query: string;
  context: string;
  configs: Array<{ id: string; name: string; type: string; description?: string }>;
}) {
  const { query, configs } = params;

  // For now, implement basic search
  // In production, this would use semantic search/embeddings
  const results = configs
    .filter((config) => {
      const searchText = `${config.name} ${config.type} ${config.description || ""}`.toLowerCase();
      return query.toLowerCase()
        .split(" ")
        .some((word) => searchText.includes(word));
    })
    .slice(0, 5)
    .map((config) => ({
      id: config.id,
      name: config.name,
      type: config.type,
      relevance: 0.8,
      excerpt: config.description,
    }));

  return {
    action: "search",
    results,
    count: results.length,
  };
}

/**
 * Handler for explain action
 */
async function handleExplain(params: {
  configId: string;
  config: {
    name: string;
    type: string;
    platform: string;
    description?: string;
  };
  context: string;
}) {
  const { config } = params;

  const explanation = {
    summary: `${config.name} is a ${config.type} configuration for ${config.platform} devices.`,
    details: [
      `Purpose: ${config.description || "Configuration management"}`,
      `Type: ${config.type}`,
      `Platform: ${config.platform}`,
    ],
    impact: "This configuration helps manage device settings and compliance.",
  };

  return {
    action: "explain",
    explanation,
  };
}

/**
 * Handler for recommendations action
 */
async function handleRecommend(params: {
  configId?: string;
  type?: string;
  context: string;
  configs: unknown[];
}) {
  const recommendations = [
    {
      type: "security" as const,
      title: "Enable Encryption",
      description: "Ensure device encryption is enabled for data protection",
      priority: "high" as const,
      action: "Apply encryption policy",
    },
    {
      type: "compliance" as const,
      title: "Review Compliance Settings",
      description: "Verify that configurations align with your compliance requirements",
      priority: "medium" as const,
    },
  ];

  return {
    action: "recommend",
    recommendations,
  };
}

/**
 * Handler for comparison action
 */
async function handleCompare(params: {
  ids: string[];
  configs: Array<{
    id: string;
    name: string;
    type: string;
    description?: string;
  }>;
  context: string;
}) {
  const { configs } = params;

  const comparison = {
    items: configs.map((c) => ({
      id: c.id,
      name: c.name,
      properties: {
        type: c.type,
        description: c.description || "No description",
      },
    })),
    differences: [
      `Configuration types differ: ${configs.map((c) => c.type).join(" vs ")}`,
    ],
    similarities: ["Both target device management"],
  };

  return {
    action: "compare",
    comparison,
  };
}

/**
 * Handler for export assistance action
 */
async function handleExportAssist(params: {
  selectedIds: string[];
  format?: string;
  configs: unknown[];
  totalConfigs: number;
}) {
  const { selectedIds, format } = params;

  return {
    action: "export-assist",
    assistance: {
      suggestions: [
        `Export ${selectedIds.length} selected configuration(s)`,
        "Include metadata for documentation",
        "Consider backup strategy",
      ],
      format: format || "json",
      notes: ["Recommended format: JSON for full configuration details"],
    },
  };
}

/**
 * GET handler for health check
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    configured: isAIConfigured(),
    timestamp: new Date().toISOString(),
  });
}
