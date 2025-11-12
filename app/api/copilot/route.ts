// CopilotKit API Route for IntuneHero
// This route handles AI requests from the CopilotKit frontend

import { CopilotRuntime, OpenAIAdapter, copilotRuntimeNextJSAppRouterEndpoint } from '@copilotkit/runtime';
import OpenAI from 'openai';
import { NextRequest } from 'next/server';
import { getAIConfig, isUsingAzureOpenAI, getAzureOpenAIConfig } from '@/lib/ai/copilot-config';
import { SYSTEM_PROMPT } from '@/lib/ai/prompts';

/**
 * Initialize OpenAI client
 */
function getOpenAIClient() {
  const config = getAIConfig();

  if (isUsingAzureOpenAI()) {
    // Azure OpenAI configuration
    const azureConfig = getAzureOpenAIConfig();
    return new OpenAI({
      apiKey: azureConfig.apiKey,
      baseURL: `${azureConfig.endpoint}/openai/deployments/${azureConfig.deploymentName}`,
      defaultQuery: { 'api-version': azureConfig.apiVersion },
      defaultHeaders: { 'api-key': azureConfig.apiKey },
    });
  } else {
    // Standard OpenAI configuration
    return new OpenAI({
      apiKey: config.apiKey,
    });
  }
}

/**
 * Create service adapter
 */
function getServiceAdapter() {
  const openai = getOpenAIClient();
  return new OpenAIAdapter({ openai: openai as any });
}

/**
 * POST handler for CopilotKit requests
 */
export async function POST(req: NextRequest) {
  try {
    // Check if API key is configured
    const config = getAIConfig();
    if (!config.apiKey && !isUsingAzureOpenAI()) {
      return new Response(
        JSON.stringify({
          error: 'AI features are not configured. Please set OPENAI_API_KEY or Azure OpenAI credentials in environment variables.',
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Log the request (for debugging)
    console.log('[COPILOT API] Processing AI request:', {
      timestamp: new Date().toISOString(),
    });

    // Use the CopilotKit Next.js App Router endpoint handler
    const serviceAdapter = getServiceAdapter();
    const runtime = new CopilotRuntime();

    const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
      runtime,
      serviceAdapter,
      endpoint: '/api/copilot',
    });

    return await handleRequest(req);
  } catch (error) {
    console.error('[COPILOT API] Error processing request:', error);

    // Return error response
    return new Response(
      JSON.stringify({
        error: 'Failed to process AI request',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * GET handler (returns status/info)
 */
export async function GET() {
  const config = getAIConfig();
  const isConfigured = !!(config.apiKey || isUsingAzureOpenAI());

  return new Response(
    JSON.stringify({
      status: 'ok',
      configured: isConfigured,
      provider: isUsingAzureOpenAI() ? 'Azure OpenAI' : 'OpenAI',
      model: config.model,
      features: config.features,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
