/**
 * Debug endpoint to check AI configuration
 * Useful for troubleshooting environment variable issues
 */

import { isAIConfigured, isAIEnabled, AI_FEATURE_FLAGS } from "@/lib/ai";

export async function GET() {
  return Response.json({
    // Environment variables
    env: {
      NEXT_PUBLIC_AI_ENABLED: process.env.NEXT_PUBLIC_AI_ENABLED,
      NEXT_PUBLIC_AI_PROVIDER: process.env.NEXT_PUBLIC_AI_PROVIDER,
      NEXT_PUBLIC_AI_MODEL: process.env.NEXT_PUBLIC_AI_MODEL,
      OPENAI_API_KEY_EXISTS: !!process.env.OPENAI_API_KEY,
      NODE_ENV: process.env.NODE_ENV,
    },
    // AI configuration status
    config: {
      isAIEnabled: isAIEnabled(),
      isAIConfigured: isAIConfigured(),
      featureFlags: AI_FEATURE_FLAGS,
    },
    // Timestamp
    timestamp: new Date().toISOString(),
  });
}
