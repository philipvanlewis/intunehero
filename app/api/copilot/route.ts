/**
 * CopilotKit Backend Route
 * Handles AI requests and integrates with OpenAI via CopilotRuntime
 */

import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import OpenAI from "openai";
import { NextRequest } from "next/server";

// IMPORTANT: Use nodejs runtime, NOT edge
export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

const serviceAdapter = new OpenAIAdapter({
  openai,
  model: process.env.NEXT_PUBLIC_AI_MODEL || "gpt-3.5-turbo",
} as any);

// Create the CopilotRuntime without manual actions - let it handle messages automatically
const copilotRuntime = new CopilotRuntime();

export async function POST(req: NextRequest) {
  try {
    console.log("[copilot/route] Received POST request");

    const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
      runtime: copilotRuntime,
      serviceAdapter,
      endpoint: "/api/copilot",
    });

    console.log("[copilot/route] Handler created, processing request");
    const response = await handleRequest(req);
    console.log("[copilot/route] Response status:", response.status);
    return response;
  } catch (error) {
    console.error("[copilot/route] Error:", error);
    return Response.json(
      {
        errors: [
          {
            message: `Internal server error: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
        ],
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json({
    status: "ok",
    service: "copilot-backend",
    configured: !!process.env.OPENAI_API_KEY,
    timestamp: new Date().toISOString(),
  });
}
