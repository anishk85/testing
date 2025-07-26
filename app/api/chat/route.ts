import { type NextRequest, NextResponse } from "next/server"
import Anthropic from '@anthropic-ai/sdk'

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  // Add debugging for Vercel
  console.log("Environment check:", {
    hasApiKey: !!process.env.ANTHROPIC_API_KEY,
    keyPrefix: process.env.ANTHROPIC_API_KEY?.substring(0, 10) + "...",
    nodeEnv: process.env.NODE_ENV
  })

  try {
    // Validate API key first
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error("❌ ANTHROPIC_API_KEY not found in environment")
      return NextResponse.json(
        { 
          error: "API key not configured",
          details: "ANTHROPIC_API_KEY environment variable is missing"
        }, 
        { status: 500 }
      )
    }

    const body = await request.json().catch(() => null)
    
    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" }, 
        { status: 400 }
      )
    }

    const { messages, temperature = 0.7, maxTokens = 8192 } = body

    // Validate request structure
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { 
          error: "Invalid request format",
          details: "Messages array is required"
        }, 
        { status: 400 }
      )
    }

    if (messages.length === 0) {
      return NextResponse.json(
        { 
          error: "Empty messages array",
          details: "At least one message is required"
        }, 
        { status: 400 }
      )
    }

    // Validate message structure
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i]
      if (!msg.role || !msg.content) {
        return NextResponse.json(
          { 
            error: `Invalid message at index ${i}`,
            details: "Each message must have 'role' and 'content' fields"
          }, 
          { status: 400 }
        )
      }
      if (!['user', 'assistant'].includes(msg.role)) {
        return NextResponse.json(
          { 
            error: `Invalid role at message ${i}`,
            details: "Role must be 'user' or 'assistant'"
          }, 
          { status: 400 }
        )
      }
    }

    // Transform messages for Claude API format
    const claudeMessages = messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
      content: msg.content
    }))

    console.log(`🚀 Processing ${claudeMessages.length} messages`)

    // Call Claude API with streaming
    const stream = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: Math.min(maxTokens, 8192),
      temperature: temperature,
      messages: claudeMessages,
      stream: true,
    })

    let fullResponse = ''
    let inputTokens = 0
    let outputTokens = 0

    // Process streaming response
    for await (const chunk of stream) {
      if (chunk.type === 'message_start') {
        inputTokens = chunk.message.usage?.input_tokens || 0
      } else if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        fullResponse += chunk.delta.text
      } else if (chunk.type === 'message_delta') {
        outputTokens = chunk.usage?.output_tokens || 0
      }
    }

    console.log(`✅ Response generated: ${fullResponse.length} chars`)

    return NextResponse.json({
      content: fullResponse || "I apologize, but I couldn't generate a response.",
      usage: {
        input_tokens: inputTokens,
        output_tokens: outputTokens,
      },
      model: 'claude-sonnet-4-20250514'
    })

  } catch (error: any) {
    console.error("❌ Claude API Error:", error)

    // Handle specific Anthropic API errors
    if (error?.status === 401) {
      return NextResponse.json(
        { 
          error: "Invalid API key",
          details: "The provided API key is invalid or expired"
        }, 
        { status: 401 }
      )
    }

    if (error?.status === 429) {
      return NextResponse.json(
        { 
          error: "Rate limit exceeded",
          details: "Too many requests. Please try again later."
        }, 
        { status: 429 }
      )
    }

    if (error?.status === 400) {
      return NextResponse.json(
        { 
          error: "Invalid request to Claude API",
          details: error.message || "Bad request format"
        }, 
        { status: 400 }
      )
    }

    // Generic error response
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error.message || "Failed to get response from Claude"
      }, 
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    message: "Claude 4 Sonnet Chat API",
    status: "Ready",
    environment: process.env.NODE_ENV || "unknown",
    hasApiKey: !!process.env.ANTHROPIC_API_KEY,
    timestamp: new Date().toISOString()
  })
}





