"use client"
import { Card } from "@/components/ui/card"
import { Sparkles, Code, HelpCircle, Lightbulb } from "lucide-react"

interface WelcomeScreenProps {
  onSamplePrompt: (prompt: string) => void
}

const samplePrompts = [
  {
    icon: <Lightbulb className="h-4 w-4" />,
    title: "Explain a concept",
    prompt: "Explain quantum computing in simple terms",
    description: "Get clear explanations of complex topics",
  },
  {
    icon: <Code className="h-4 w-4" />,
    title: "Write code",
    prompt: "Write a Python function to sort a list of dictionaries by a specific key",
    description: "Generate code snippets and solutions",
  },
  {
    icon: <HelpCircle className="h-4 w-4" />,
    title: "Get help",
    prompt: "What are the benefits of renewable energy?",
    description: "Ask questions and get detailed answers",
  },
  {
    icon: <Sparkles className="h-4 w-4" />,
    title: "Creative writing",
    prompt: "Write a short story about a robot learning to paint",
    description: "Generate creative content and stories",
  },
]

export default function WelcomeScreen({ onSamplePrompt }: WelcomeScreenProps) {
  return (
    <div className="text-center py-12 space-y-8">
      <div className="space-y-4">
        <div className="text-6xl mb-4">🤖</div>
        <h2 className="text-3xl font-bold tracking-tight">Welcome to Claude Chat</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Start a conversation with Claude Sonnet 4. Ask questions, get help with coding, explore ideas, or just have a
          chat!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {samplePrompts.map((sample, index) => (
          <Card
            key={index}
            className="p-4 hover:shadow-md transition-shadow cursor-pointer group"
            onClick={() => onSamplePrompt(sample.prompt)}
          >
            <div className="flex items-start gap-3 text-left">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                {sample.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm mb-1">{sample.title}</h3>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{sample.description}</p>
                <p className="text-xs text-primary font-medium group-hover:text-primary/80 transition-colors">
                  "{sample.prompt}"
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
        <span className="bg-muted px-2 py-1 rounded">💡 Demo Mode Active</span>
        <span className="bg-muted px-2 py-1 rounded">🔄 Mock Responses</span>
        <span className="bg-muted px-2 py-1 rounded">🎨 Full UI Features</span>
      </div>
    </div>
  )
}
