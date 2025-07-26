"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, RotateCcw, Check, User, Bot, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  status?: "sending" | "sent" | "error"
}

interface MessageBubbleProps {
  message: Message
  onRetry?: () => void
}

export default function MessageBubble({ message, onRetry }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "Copied!",
        description: "Message copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy message",
        variant: "destructive",
      })
    }
  }

  const isUser = message.role === "user"
  const isError = message.status === "error"
  const isSending = message.status === "sending"

  return (
    <div className={`flex gap-3 message-enter group ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          isUser
            ? "bg-primary text-primary-foreground"
            : isError
              ? "bg-destructive text-destructive-foreground"
              : "bg-secondary text-secondary-foreground"
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : isError ? (
          <AlertCircle className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[80%] ${isUser ? "text-right" : ""}`}>
        <div
          className={`inline-block p-4 rounded-2xl relative ${
            isUser
              ? "bg-primary text-primary-foreground ml-auto"
              : isError
                ? "bg-destructive/10 border border-destructive/20 text-destructive-foreground"
                : "bg-muted"
          } ${isUser ? "rounded-br-md" : "rounded-bl-md"} ${isSending ? "opacity-70" : ""}`}
        >
          <div className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</div>

          {/* Sending indicator */}
          {isSending && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-primary-foreground rounded-full animate-pulse" />
            </div>
          )}
        </div>

        {/* Message Footer */}
        <div className={`flex items-center gap-2 mt-2 text-xs text-muted-foreground ${isUser ? "justify-end" : ""}`}>
          <span>
            {message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>

          {message.status && message.status !== "sent" && (
            <Badge variant={message.status === "error" ? "destructive" : "secondary"} className="text-xs">
              {message.status}
            </Badge>
          )}

          {/* Action Buttons */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="h-6 w-6 p-0 hover:bg-muted"
              title="Copy message"
            >
              {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
            </Button>

            {onRetry && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRetry}
                className="h-6 w-6 p-0 hover:bg-muted"
                title="Retry message"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
