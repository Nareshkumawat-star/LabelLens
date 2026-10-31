"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Loader2, AlertCircle, Calendar, ShieldCheck, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ReportView } from "@/components/label-lens/report-view"
import { AskYourLabel } from "@/components/label-lens/ask-your-label"
import type { ScanDetail } from "@/lib/types"

function ScanDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-28 rounded-xl border bg-muted/30 p-6 space-y-3">
        <div className="h-6 w-1/3 rounded bg-muted" />
        <div className="h-4 w-1/2 rounded bg-muted" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="h-64 rounded-xl border bg-muted/20" />
          <div className="h-80 rounded-xl border bg-muted/20" />
        </div>
        <div className="space-y-6">
          <div className="h-96 rounded-xl border bg-muted/20" />
        </div>
      </div>
    </div>
  )
}

export default function ScanDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id

  const [detail, setDetail] = React.useState<ScanDetail | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)

    fetch(`/api/scans/${id}`)
      .then(async (res) => {
        const data = await res.json()
        if (cancelled) return
        if (!res.ok || !data.success) {
          setError(data?.error ?? "Could not find or load this scan record.")
          return
        }
        setDetail(data as ScanDetail)
      })
      .catch(() => {
        if (!cancelled) setError("Network error loading this scan record.")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  return (
    <div className="container max-w-6xl space-y-6 py-8">
      {/* Navigation Breadcrumb Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-2 text-sm">
          <Button asChild variant="ghost" size="sm" className="-ml-2 h-8 px-2 text-muted-foreground hover:text-foreground">
            <Link href="/">
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Scanner
            </Link>
          </Button>
          <span className="text-muted-foreground/60">/</span>
          <span className="font-semibold text-foreground truncate max-w-xs sm:max-w-md">
            {detail?.scan?.report?.productName ?? id}
          </span>
        </div>

        <Button asChild size="sm" variant="outline" className="h-8">
          <Link href="/">
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Scan Another Label
          </Link>
        </Button>
      </div>

      {/* Loading Skeleton */}
      {loading && <ScanDetailSkeleton />}

      {/* Error View */}
      {error && !loading && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Scan Record Unavailable</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">{error}</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      )}

      {/* Detail Content */}
      {detail && !loading && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          {/* Metadata Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card/60 p-4 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Scanned on:</span>
              <time className="font-medium tabular-nums text-foreground">
                {new Date(detail.scan.createdAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </time>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/25">
                <ShieldCheck className="h-3 w-3" />
                Verified In-Memory
              </span>
              <Badge variant="outline" className="font-mono text-[10px]">
                ID: {detail.scan.id.slice(0, 12)}
              </Badge>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <ReportView report={detail.scan.report} />
            </div>
            <div>
              <AskYourLabel scanId={detail.scan.id} initialQuestions={detail.questions} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
