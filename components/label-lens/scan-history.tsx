"use client"

import * as React from "react"
import Link from "next/link"
import { History, Trash2, Loader2, ArrowRight, Tag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ScanSummary {
  id: string
  productName: string | null
  brand: string | null
  category: string | null
  createdAt: string
  summary: string
}

export function ScanHistory({ refreshKey = 0 }: { refreshKey?: number }) {
  const [scans, setScans] = React.useState<ScanSummary[] | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [busyId, setBusyId] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    setError(null)

    fetch("/api/scans")
      .then(async (res) => {
        const data = await res.json()
        if (cancelled) return
        if (!res.ok || !data.success) {
          setError(data?.error ?? "Could not load history.")
          setScans([])
          return
        }
        setScans(data.scans as ScanSummary[])
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not load history.")
          setScans([])
        }
      })

    return () => {
      cancelled = true
    }
  }, [refreshKey])

  const remove = async (id: string) => {
    setBusyId(id)
    try {
      const res = await fetch(`/api/scans/${id}`, { method: "DELETE" })
      if (res.ok) setScans((prev) => (prev ? prev.filter((s) => s.id !== id) : prev))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <Card className="border bg-card shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <History className="h-5 w-5 text-primary shrink-0" />
            <span>Scan History</span>
          </CardTitle>
          {scans && scans.length > 0 && (
            <span className="text-xs font-semibold tabular-nums text-muted-foreground">
              {scans.length} {scans.length === 1 ? "record" : "records"}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Stored locally for demo inspection. Unauthenticated session memory.
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {scans === null && (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span>Retrieving scan log…</span>
          </div>
        )}

        {error && (
          <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </p>
        )}

        {scans !== null && scans.length === 0 && !error && (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <History className="mx-auto h-8 w-8 text-muted-foreground/60" />
            <p className="mt-2 text-sm font-semibold text-foreground">No recent scans</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Completed label analyses will be cataloged here for quick review.
            </p>
          </div>
        )}

        {scans && scans.length > 0 && (
          <div className="divide-y rounded-xl border overflow-hidden">
            {scans.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-3 p-3.5 hover:bg-muted/30 transition-colors"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/scan/${s.id}`}
                      className="truncate text-sm font-bold text-foreground hover:underline"
                    >
                      {s.productName ?? "Unnamed Product"}
                    </Link>
                    {s.category && (
                      <Badge variant="outline" className="text-[10px] capitalize shrink-0">
                        {s.category}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {s.brand && <span className="font-medium text-foreground/80">{s.brand}</span>}
                    {s.brand && <span>·</span>}
                    <time className="tabular-nums">
                      {new Date(s.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button asChild size="sm" variant="ghost" className="h-8 px-2 text-xs">
                    <Link href={`/scan/${s.id}`}>
                      View <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Delete scan"
                    disabled={busyId === s.id}
                    onClick={() => void remove(s.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    {busyId === s.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
