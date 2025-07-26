import { Bot } from "lucide-react"

export default function TypingIndicator() {
  return (
    <div className="flex gap-3 message-enter">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-sm">
        <Bot className="h-4 w-4" />
      </div>

      <div className="flex-1">
        <div className="inline-block p-4 rounded-2xl rounded-bl-md bg-muted">
          <div className="flex gap-1 items-center">
            <div className="w-2 h-2 bg-muted-foreground rounded-full typing-dot" />
            <div className="w-2 h-2 bg-muted-foreground rounded-full typing-dot" />
            <div className="w-2 h-2 bg-muted-foreground rounded-full typing-dot" />
          </div>
        </div>

        <div className="text-xs text-muted-foreground mt-2">Claude is thinking...</div>
      </div>
    </div>
  )
}
