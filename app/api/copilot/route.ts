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

const copilotRuntime = new CopilotRuntime();

export async function POST(req: NextRequest) {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime: copilotRuntime,
    serviceAdapter,
    endpoint: "/api/copilot",
  });

  return handleRequest(req);
}

export async function GET() {
  return Response.json({
    status: "ok",
    service: "copilot-backend",
    configured: !!process.env.OPENAI_API_KEY,
    timestamp: new Date().toISOString(),
  });
}
