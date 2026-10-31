"use client"

import * as React from "react"
import { Send, Loader2, MessageCircle } from "lucide-react"

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
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="h-5 w-5 text-primary" /> Ask Your Label
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Answers come only from this scan&apos;s saved report. Anything absent is reported as
          unavailable.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {history.length > 0 && (
          <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {history.map((h) => (
              <div key={h.id || `${h.question}-${h.createdAt}`} className="space-y-1">
                <p className="ml-auto w-fit max-w-[85%] rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground">
                  {h.question}
                </p>
                <p className="w-fit max-w-[85%] rounded-lg bg-muted px-3 py-1.5 text-sm">{h.answer}</p>
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <form
          className="flex gap-2"
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
            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button type="submit" size="icon" disabled={busy || !question.trim()}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>

        {history.length === 0 && (
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => void ask(s)}
                disabled={busy}
                className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
