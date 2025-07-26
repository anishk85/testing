"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import ThemeToggle from "./theme-toggle"
import { Trash2, Download, Settings, Info, Github } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

interface ChatHeaderProps {
  onClearChat: () => void
  onExportChat: () => void
}

export default function ChatHeader({ onClearChat, onExportChat }: ChatHeaderProps) {
  return (
    <header className="border-b p-4 flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <div className="text-2xl">🤖</div>
        <div>
          <h1 className="text-xl font-semibold">Claude Chat</h1>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              Demo Mode
            </Badge>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            <span className="text-xs text-muted-foreground">Mock Backend</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => window.open("https://github.com", "_blank")}
          title="View on GitHub"
        >
          <Github className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" title="Settings">
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onExportChat}>
              <Download className="h-4 w-4 mr-2" />
              Export Chat
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onClearChat} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Chat
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <Info className="h-4 w-4 mr-2" />
              Demo Version v1.0
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ThemeToggle />
      </div>
    </header>
  )
}
