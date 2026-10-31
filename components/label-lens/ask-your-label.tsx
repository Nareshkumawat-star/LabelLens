"use client"

import * as React from "react"
import { Send, Loader2, MessageCircle, Sparkles, HelpCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ScanQuestionRecord } from "@/lib/types"

interface Props {
  scanId: string
  initialQuestions?: ScanQuestionRecord[]
}

const SUGGESTIONS = [
  "Does this contain added sugar?",
  "Which allergens are declared?",
  "What is the serving size?",
  "What could not be read on this label?",
]

export function AskYourLabel({ scanId, initialQuestions = [] }: Props) {
  const [history, setHistory] = React.useState<ScanQuestionRecord[]>(initialQuestions)
  const [question, setQuestion] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [history, busy])

  const ask = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || busy) return

    setBusy(true)
    setError(null)
    setQuestion("")

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanId, question: trimmed }),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data?.error ?? `Could not answer (HTTP ${res.status}).`)
        return
      }

      setHistory((prev) => [...prev, data.question as ScanQuestionRecord])
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="border bg-card shadow-xs">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-bold">
          <MessageCircle className="h-5 w-5 text-primary shrink-0" />
          <span>Ask Your Label</span>
        </CardTitle>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Grounded Q&A. Answers draw strictly from this product&apos;s verified analysis.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chat History Container */}
        <div
          ref={scrollRef}
          className="max-h-80 min-h-[140px] space-y-3 overflow-y-auto rounded-lg border bg-muted/20 p-3"
        >
          {history.length === 0 && !busy && (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Sparkles className="h-6 w-6 text-muted-foreground/60 mb-2" />
              <p className="text-xs font-semibold text-foreground">No questions yet</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[200px]">
                Tap a suggested question below or type your own question about ingredients.
              </p>
            </div>
          )}

          {history.map((h) => (
            <div key={h.id || `${h.question}-${h.createdAt}`} className="space-y-1.5 text-xs">
              <div className="flex justify-end">
                <p className="max-w-[85%] rounded-2xl rounded-tr-xs bg-primary px-3.5 py-2 text-primary-foreground font-medium shadow-2xs">
                  {h.question}
                </p>
              </div>
              <div className="flex justify-start">
                <div className="max-w-[90%] rounded-2xl rounded-tl-xs border bg-card px-3.5 py-2.5 text-foreground leading-relaxed shadow-2xs space-y-1">
                  <p>{h.answer}</p>
                </div>
              </div>
            </div>
          ))}

          {busy && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground italic py-1">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              <span>Synthesizing verified answer…</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold text-muted-foreground">Suggested Inquiries</div>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                type="button"
                disabled={busy}
                onClick={() => void ask(s)}
                className="rounded-full border bg-background px-2.5 py-1 text-[11px] font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="rounded-md border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive">
            {error}
          </p>
        )}

        {/* Input Form */}
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            void ask(question)
          }}
        >
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about this label…"
            maxLength={500}
            className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button
            type="submit"
            size="icon"
            disabled={busy || !question.trim()}
            className="h-9 w-9 shrink-0"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only">Send Question</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
