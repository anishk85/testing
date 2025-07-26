"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import MessageBubble from "./message-bubble"
import TypingIndicator from "./typing-indicator"
import ChatHeader from "./chat-header"
import WelcomeScreen from "./welcome-screen"
import { Send, RotateCcw, ChevronDown, ChevronUp, Copy, Check } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css' // You can choose different themes

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  status?: "sending" | "sent" | "error"
  isExpanded?: boolean
}

// 📝 Configuration Constants
const CONFIG = {
  MAX_TOKENS: 400000,
  MAX_INPUT_CHARS: 700000,
  PREVIEW_LENGTH: 200000,
  API_TIMEOUT: 3000000,
} as const

// 🎨 Custom Markdown Components
const MarkdownComponents = {
  code: ({ node, inline, className, children, ...props }: any) => {
    const [copied, setCopied] = useState(false)
    
    const handleCopy = async () => {
      await navigator.clipboard.writeText(String(children).replace(/\n$/, ''))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }

    const match = /language-(\w+)/.exec(className || '')
    const language = match ? match[1] : ''

    if (inline) {
      return (
        <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono" {...props}>
          {children}
        </code>
      )
    }

    return (
      <div className="relative group">
        <div className="flex items-center justify-between bg-muted/50 px-4 py-2 border-b">
          <span className="text-xs font-medium text-muted-foreground">
            {language || 'code'}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 px-2"
          >
            {copied ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
        <pre className="overflow-x-auto p-4 bg-muted/30 rounded-b-md">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      </div>
    )
  },
  pre: ({ children }: any) => <div className="not-prose">{children}</div>,
  h1: ({ children }: any) => <h1 className="text-2xl font-bold mt-6 mb-4">{children}</h1>,
  h2: ({ children }: any) => <h2 className="text-xl font-semibold mt-5 mb-3">{children}</h2>,
  h3: ({ children }: any) => <h3 className="text-lg font-medium mt-4 mb-2">{children}</h3>,
  ul: ({ children }: any) => <ul className="list-disc list-inside space-y-1 my-3">{children}</ul>,
  ol: ({ children }: any) => <ol className="list-decimal list-inside space-y-1 my-3">{children}</ol>,
  li: ({ children }: any) => <li className="text-sm">{children}</li>,
  p: ({ children }: any) => <p className="mb-3 leading-relaxed">{children}</p>,
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-4 border-primary/30 pl-4 italic my-3 text-muted-foreground">
      {children}
    </blockquote>
  ),
  table: ({ children }: any) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border border-border">{children}</table>
    </div>
  ),
  th: ({ children }: any) => (
    <th className="border border-border px-3 py-2 bg-muted font-medium text-left">{children}</th>
  ),
  td: ({ children }: any) => (
    <td className="border border-border px-3 py-2">{children}</td>
  ),
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [isInputFocused, setIsInputFocused] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // 🎯 Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages, isTyping])

  // 🎯 Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const toggleMessageExpansion = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, isExpanded: !msg.isExpanded } : msg
      )
    )
  }

  const getMessagePreview = (content: string, maxLength: number = CONFIG.PREVIEW_LENGTH) => {
    // Split by paragraphs (double line breaks)
    const paragraphs = content.split('\n\n').filter(p => p.trim())
    
    if (paragraphs.length === 0) return content
    
    // Return first paragraph, truncated if too long
    const firstParagraph = paragraphs[0].trim()
    if (firstParagraph.length <= maxLength) {
      return firstParagraph
    }
    
    return firstParagraph.slice(0, maxLength) + "..."
  }

  const shouldShowPreview = (message: Message) => {
    if (message.role === "user") return false
    if (message.isExpanded) return false
    
    const paragraphs = message.content.split('\n\n').filter(p => p.trim())
    return paragraphs.length > 1 || message.content.length > CONFIG.PREVIEW_LENGTH
  }

  // 🚀 Enhanced Send Message Function
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: "user",
      timestamp: new Date(),
      status: "sent",
      isExpanded: false,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setIsTyping(true)

    // Create AbortController for timeout handling
    const abortController = new AbortController()
    const timeoutId = setTimeout(() => abortController.abort(), CONFIG.API_TIMEOUT)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          maxTokens: CONFIG.MAX_TOKENS,
          temperature: 0.7,
        }),
        signal: abortController.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.content) {
        throw new Error("No content received from API")
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.content,
        role: "assistant",
        timestamp: new Date(),
        status: "sent",
        isExpanded: false,
      }

      setMessages((prev) => [...prev, assistantMessage])

      // 📊 Log usage statistics if available
      if (data.usage) {
        console.log(`📊 Token Usage: ${data.usage.input_tokens + data.usage.output_tokens}/${CONFIG.MAX_TOKENS}`)
      }

    } catch (error) {
      clearTimeout(timeoutId)
      console.error("Error sending message:", error)
      
      let errorMessage = "Failed to send message. Please try again."
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = "Request timed out. Please try a shorter message."
        } else if (error.message.includes("401")) {
          errorMessage = "API authentication failed. Please check your API key."
        } else if (error.message.includes("429")) {
          errorMessage = "Rate limit exceeded. Please wait a moment and try again."
        } else if (error.message.includes("400")) {
          errorMessage = "Invalid request. Please try rephrasing your message."
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })

      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `I'm sorry, I encountered an error: ${errorMessage}`,
        role: "assistant",
        timestamp: new Date(),
        status: "error",
        isExpanded: false,
      }
      setMessages((prev) => [...prev, errorResponse])
    } finally {
      setIsLoading(false)
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
    toast({
      title: "Chat cleared",
      description: "All messages have been removed.",
    })
  }

  const retryLastMessage = () => {
    if (messages.length >= 2) {
      const lastUserMessage = messages[messages.length - 2]
      if (lastUserMessage.role === "user") {
        setMessages((prev) => prev.slice(0, -1))
        setInput(lastUserMessage.content)
        setTimeout(() => {
          inputRef.current?.focus()
        }, 100)
      }
    }
  }

  const exportChat = () => {
    const chatData = {
      timestamp: new Date().toISOString(),
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
      })),
    }

    const blob = new Blob([JSON.stringify(chatData, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `claude-chat-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Chat exported",
      description: "Your chat history has been downloaded as JSON.",
    })
  }

  const handleSamplePrompt = (prompt: string) => {
    setInput(prompt)
    inputRef.current?.focus()
  }

  // 🎨 Calculate input progress for visual feedback
  const inputProgress = (input.length / CONFIG.MAX_INPUT_CHARS) * 100
  const isInputNearLimit = inputProgress > 80

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto border-x bg-background">
      <ChatHeader onClearChat={clearChat} onExportChat={exportChat} />

      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4 min-h-full">
          {messages.length === 0 && <WelcomeScreen onSamplePrompt={handleSamplePrompt} />}

          {messages.map((message) => (
            <div key={message.id} className="space-y-2">
              <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  } ${message.status === "error" ? "border border-destructive" : ""}`}
                >
                  <div className="text-sm">
                    {message.role === "assistant" ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                        components={MarkdownComponents}
                      >
                        {shouldShowPreview(message) && !message.isExpanded
                          ? getMessagePreview(message.content)
                          : message.content}
                      </ReactMarkdown>
                    ) : (
                      <div className="whitespace-pre-wrap">
                        {message.content}
                      </div>
                    )}
                  </div>
                  
                  {shouldShowPreview(message) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleMessageExpansion(message.id)}
                      className="mt-2 h-6 px-2 text-xs"
                    >
                      {message.isExpanded ? (
                        <>
                          <ChevronUp className="h-3 w-3 mr-1" />
                          Show less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3 mr-1" />
                          Show more
                        </>
                      )}
                    </Button>
                  )}
                  
                  <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                    <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                    {message.status === "error" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={retryLastMessage}
                        className="h-6 px-2 text-xs"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Retry
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isTyping && <TypingIndicator />}
        </div>
      </ScrollArea>

      {/* 💬 Enhanced Input Section */}
      <div className={`border-t p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200 ${
        isInputFocused ? "shadow-lg" : ""
      }`}>
        <div className="flex gap-2">
            <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              placeholder="Type your message... (Markdown supported)"
              disabled={isLoading}
              className={`pr-12 ${isInputNearLimit ? 'border-yellow-500' : ''}`}
              maxLength={CONFIG.MAX_INPUT_CHARS}
              autoComplete="off"
              spellCheck={true}
            />
            {messages.length > 0 && (
              <Button
              size="sm"
              variant="ghost"
              onClick={retryLastMessage}
              className="absolute right-12 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              disabled={isLoading}
              title="Retry last message"
              >
              <RotateCcw className="h-4 w-4" />
              </Button>
            )}
            </div>
          <Button onClick={sendMessage} disabled={!input.trim() || isLoading} size="icon" className="shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground mt-2 text-center">
          Press Enter to send • Shift+Enter for new line • Powered by Claude 3.5 Sonnet • Max {CONFIG.MAX_TOKENS.toLocaleString()} tokens
        </div>
        
        {input.length > 0 && (
          <div className={`text-xs mt-1 text-right ${isInputNearLimit ? 'text-yellow-600' : 'text-muted-foreground'}`}>
            {input.length.toLocaleString()}/{CONFIG.MAX_INPUT_CHARS.toLocaleString()} characters
            {isInputNearLimit && ' ⚠️'}
          </div>
        )}
      </div>
    </div>
  )
}
