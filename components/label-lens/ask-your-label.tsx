"use client"

import * as React from "react"
import {
  Send,
  Loader2,
  MessageCircle,
  Sparkles,
  AlertCircle,
  RotateCcw,
  Languages,
  Check,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ProductReport, ScanQuestionRecord } from "@/lib/types"

type Lang = "en" | "hi"
type Turn = { question: string; answer: string }

interface Props {
  /** Saved scan id. Empty for a guest analysis. */
  scanId: string
  /** Guest mode: pass the report already in the browser instead of a scan id. */
  report?: ProductReport
  /** When provided (scan detail page) the panel uses it instead of re-fetching. */
  initialQuestions?: ScanQuestionRecord[]
}

const COPY: Record<
  Lang,
  {
    title: string
    subtitle: string
    empty: string
    emptyHint: string
    thinking: string
    suggestions: string
    placeholder: string
    send: string
    retry: string
    failed: string
    notSaved: string
    loadingHistory: string
    suggestionsList: string[]
  }
> = {
  en: {
    title: "Ask Your Label",
    subtitle: "Answers use only this product's saved report.",
    empty: "No questions yet",
    emptyHint: "Tap a suggestion below or type your own question.",
    thinking: "Reading the saved report…",
    suggestions: "Suggested questions",
    placeholder: "Ask about this label…",
    send: "Send question",
    retry: "Retry",
    failed: "The agent could not answer",
    notSaved: "Answer shown, but chat history could not be saved.",
    loadingHistory: "Loading earlier questions…",
    suggestionsList: [
      "Does this contain added sugar?",
      "Which allergens are declared?",
      "What is the serving size?",
      "What could not be read on this label?",
    ],
  },
  hi: {
    title: "अपने लेबल से पूछें",
    subtitle: "उत्तर केवल इस उत्पाद की सहेजी गई रिपोर्ट से लिए जाते हैं।",
    empty: "अभी कोई प्रश्न नहीं",
    emptyHint: "नीचे कोई सुझाव चुनें या अपना प्रश्न टाइप करें।",
    thinking: "सहेजी गई रिपोर्ट पढ़ी जा रही है…",
    suggestions: "सुझाए गए प्रश्न",
    placeholder: "इस लेबल के बारे में पूछें…",
    send: "प्रश्न भेजें",
    retry: "फिर कोशिश करें",
    failed: "एजेंट उत्तर नहीं दे सका",
    notSaved: "उत्तर दिखाया गया, लेकिन चैट इतिहास सहेजा नहीं जा सका।",
    loadingHistory: "पिछले प्रश्न लोड हो रहे हैं…",
    suggestionsList: [
      "क्या इसमें अतिरिक्त चीनी है?",
      "कौन से एलर्जेन घोषित हैं?",
      "सर्विंग साइज़ क्या है?",
      "लेबल पर क्या पढ़ा नहीं जा सका?",
    ],
  },
}

/** Number of earlier turns sent as context, most recent last. */
const CONTEXT_TURNS = 6

export function AskYourLabel({ scanId, report, initialQuestions }: Props) {
  const isGuest = Boolean(report && !scanId)
  const [lang, setLang] = React.useState<Lang>("en")
  const t = COPY[lang]

  const [history, setHistory] = React.useState<ScanQuestionRecord[]>(initialQuestions ?? [])
  const [question, setQuestion] = React.useState("")
  const [pending, setPending] = React.useState<string | null>(null)
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [failedQuestion, setFailedQuestion] = React.useState<string | null>(null)
  const [notice, setNotice] = React.useState<string | null>(null)
  const [hydrating, setHydrating] = React.useState(initialQuestions === undefined)

  const scrollRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Restore earlier turns when the caller did not hand them over (e.g. a scan
  // opened from the history strip on /scan).
  React.useEffect(() => {
    if (isGuest) {
      setHydrating(false)
      return
    }
    if (initialQuestions !== undefined) {
      setHistory(initialQuestions)
      setHydrating(false)
      return
    }
    if (!scanId) {
      setHydrating(false)
      return
    }

    let cancelled = false
    setHydrating(true)

    fetch(`/api/scans/${scanId}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        if (data?.success && Array.isArray(data.questions)) {
          setHistory(data.questions as ScanQuestionRecord[])
        }
      })
      .catch(() => {
        // History is a convenience; the panel still works without it.
      })
      .finally(() => {
        if (!cancelled) setHydrating(false)
      })

    return () => {
      cancelled = true
    }
  }, [scanId, initialQuestions, isGuest])

  React.useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [history, pending, busy])

  const ask = React.useCallback(
    async (raw: string) => {
      const text = raw.trim()
      if (!text || busy) return

      setBusy(true)
      setError(null)
      setNotice(null)
      setFailedQuestion(null)
      setQuestion("")
      setPending(text)

      const context: Turn[] = history
        .slice(-CONTEXT_TURNS)
        .map(({ question: q, answer: a }) => ({ question: q, answer: a }))

      try {
        const payload: Record<string, unknown> = {
          question: text,
          language: lang,
          history: context,
        }
        if (scanId) payload.scanId = scanId
        else if (report) payload.report = report

        const res = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

        const data = await res.json().catch(() => null)

        if (!res.ok || !data?.success) {
          const detail = Array.isArray(data?.details) ? ` (${data.details.join("; ")})` : ""
          setError(`${data?.error ?? `Request failed (HTTP ${res.status}).`}${detail}`)
          setFailedQuestion(text)
          return
        }

        setHistory((prev) => [...prev, data.question as ScanQuestionRecord])
        if (data.persisted === false) setNotice(t.notSaved)
      } catch {
        setError("Network error. Check your connection and try again.")
        setFailedQuestion(text)
      } finally {
        setPending(null)
        setBusy(false)
        inputRef.current?.focus()
      }
    },
    [busy, history, lang, scanId, report, t.notSaved]
  )

  return (
    <Card className="border bg-card shadow-sm lg:sticky lg:top-20">
      <CardHeader className="space-y-2 pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <MessageCircle className="h-4.5 w-4.5 shrink-0 text-primary" />
            <span>{t.title}</span>
          </CardTitle>

          <div
            className="flex shrink-0 items-center gap-0.5 rounded-lg border border-border/60 bg-muted/20 p-0.5"
            role="group"
            aria-label="Answer language"
          >
            <Languages className="mx-1 h-3.5 w-3.5 text-muted-foreground" aria-hidden />
            {(["en", "hi"] as const).map((code) => (
              <button
                key={code}
                type="button"
                aria-pressed={lang === code}
                onClick={() => setLang(code)}
                className={`rounded-md px-2 py-0.5 text-[11px] font-semibold transition-colors ${
                  lang === code
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {code === "en" ? "EN" : "हिं"}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">{t.subtitle}</p>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Conversation */}
        <div
          ref={scrollRef}
          aria-live="polite"
          className="max-h-[55vh] min-h-[200px] space-y-3 overflow-y-auto rounded-lg border bg-muted/20 p-3"
        >
          {hydrating && (
            <div className="flex items-center justify-center gap-2 py-3 text-[11px] text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {t.loadingHistory}
            </div>
          )}

          {!hydrating && history.length === 0 && !pending && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Sparkles className="mb-2 h-6 w-6 text-muted-foreground/60" />
              <p className="text-xs font-semibold text-foreground">{t.empty}</p>
              <p className="mt-0.5 max-w-[210px] text-[11px] text-muted-foreground">{t.emptyHint}</p>
            </div>
          )}

          {history.map((turn, index) => (
            <div key={turn.id || `${turn.createdAt}-${index}`} className="space-y-1.5 text-xs">
              <div className="flex justify-end">
                <p className="max-w-[85%] rounded-2xl rounded-tr-xs bg-primary px-3.5 py-2 font-medium text-primary-foreground shadow-2xs">
                  {turn.question}
                </p>
              </div>
              <div className="flex justify-start">
                <p className="max-w-[90%] whitespace-pre-wrap rounded-2xl rounded-tl-xs border bg-card px-3.5 py-2.5 leading-relaxed text-foreground shadow-2xs">
                  {turn.answer}
                </p>
              </div>
            </div>
          ))}

          {pending && (
            <>
              <div className="flex justify-end">
                <p className="max-w-[85%] rounded-2xl rounded-tr-xs bg-primary px-3.5 py-2 font-medium text-primary-foreground opacity-80 shadow-2xs">
                  {pending}
                </p>
              </div>
              <div className="flex items-center gap-2 py-1 text-xs italic text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                <span>{t.thinking}</span>
              </div>
            </>
          )}
        </div>

        {/* Suggestions */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold text-muted-foreground">{t.suggestions}</div>
          <div className="flex flex-wrap gap-1.5">
            {t.suggestionsList.map((s) => (
              <button
                key={s}
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
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-2.5 text-xs">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
            <div className="space-y-1.5">
              <p className="font-medium text-destructive">
                {t.failed}: {error}
              </p>
              {failedQuestion && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1 text-[11px]"
                  onClick={() => void ask(failedQuestion)}
                  disabled={busy}
                >
                  <RotateCcw className="h-3 w-3" />
                  {t.retry}
                </Button>
              )}
            </div>
          </div>
        )}

        {notice && (
          <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Check className="h-3 w-3 text-primary" />
            {notice}
          </p>
        )}

        {/* Composer */}
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            void ask(question)
          }}
        >
          <input
            ref={inputRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={t.placeholder}
            maxLength={500}
            aria-label={t.placeholder}
            className="min-w-0 flex-1 rounded-lg border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button
            type="submit"
            size="icon"
            disabled={busy || !question.trim()}
            className="h-9 w-9 shrink-0"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only">{t.send}</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
