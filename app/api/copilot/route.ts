/**
 * CopilotKit Backend Route
 * Handles AI requests and integrates with OpenAI
 */

import { NextRequest, NextResponse } from "next/server";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const messages = body.messages as Message[];

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 503 }
      );
    }

    console.log("[API /copilot] Calling OpenAI with", messages.length, "messages");

    // Call OpenAI API
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.NEXT_PUBLIC_AI_MODEL || "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are an expert assistant for Intune configuration management. Help users understand, configure, and manage their Intune environment. Provide clear, concise, and actionable advice.",
          },
          ...messages,
        ],
        temperature: parseFloat(process.env.NEXT_PUBLIC_AI_TEMPERATURE || "0.7"),
        max_tokens: parseInt(process.env.NEXT_PUBLIC_AI_MAX_TOKENS || "2000"),
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error("[API /copilot] OpenAI API error:", errorData);
      return NextResponse.json(
        { error: "OpenAI API error", details: errorData.error },
        { status: openaiResponse.status }
      );
    }

    const openaiData = await openaiResponse.json();
    console.log("[API /copilot] OpenAI response received");

    // Extract the assistant's response
    const assistantMessage = openaiData.choices[0]?.message?.content;

    if (!assistantMessage) {
      return NextResponse.json(
        { error: "No response from OpenAI" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      content: assistantMessage,
      usage: openaiData.usage,
    });
  } catch (error) {
    console.error("[API /copilot] Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "copilot-backend",
    configured: !!process.env.OPENAI_API_KEY,
    timestamp: new Date().toISOString(),
  });
}
