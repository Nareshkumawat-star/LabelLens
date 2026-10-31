"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ReportView } from "@/components/label-lens/report-view"
import { AskYourLabel } from "@/components/label-lens/ask-your-label"
import type { ScanDetail } from "@/lib/types"

export default function ScanDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id

  const [detail, setDetail] = React.useState<ScanDetail | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!id) return
    let cancelled = false

    fetch(`/api/scans/${id}`)
      .then(async (res) => {
        const data = await res.json()
        if (cancelled) return
        if (!res.ok || !data.success) {
          setError(data?.error ?? "Could not load this scan.")
          return
        }
        setDetail(data as ScanDetail)
      })
      .catch(() => {
        if (!cancelled) setError("Could not load this scan.")
      })

    return () => {
      cancelled = true
    }
  }, [id])

  return (
    <div className="container max-w-6xl space-y-6 py-8">
      <Button asChild variant="ghost" size="sm">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Link>
      </Button>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {!detail && !error && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading scan…
        </p>
      )}

      {detail && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ReportView report={detail.scan.report} />
          </div>
          <div>
            <AskYourLabel scanId={detail.scan.id} initialQuestions={detail.questions} />
          </div>
        </div>
      )}
    </div>
  )
}
