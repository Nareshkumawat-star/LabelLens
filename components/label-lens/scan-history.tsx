"use client"

import * as React from "react"
import Link from "next/link"
import { History, Trash2, Loader2, ArrowRight, Eye, ChevronDown, ChevronUp } from "lucide-react"

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

interface ScanHistoryProps {
  refreshKey?: number
  onSelectScan?: (id: string) => void
  activeScanId?: string | null
}

export function ScanHistory({ refreshKey = 0, onSelectScan, activeScanId }: ScanHistoryProps) {
  const [scans, setScans] = React.useState<ScanSummary[] | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [guest, setGuest] = React.useState(false)
  const [busyId, setBusyId] = React.useState<string | null>(null)
  const [showAll, setShowAll] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false
    setError(null)
    setGuest(false)

    fetch("/api/scans")
      .then(async (res) => {
        const data = await res.json()
        if (cancelled) return
        if (res.status === 401) {
          // Guest: nothing was ever stored for them, so there is nothing to list.
          setGuest(true)
          setScans([])
          return
        }
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

  const remove = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setBusyId(id)
    try {
      const res = await fetch(`/api/scans/${id}`, { method: "DELETE" })
      if (res.ok) setScans((prev) => (prev ? prev.filter((s) => s.id !== id) : prev))
    } finally {
      setBusyId(null)
    }
  }

  const displayedScans = scans ? (showAll ? scans : scans.slice(0, 3)) : []

  return (
    <Card className="border bg-card shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <History className="h-4 w-4 shrink-0" />
            </div>
            <CardTitle className="text-base font-bold">Recent Food Scans</CardTitle>
            {scans && scans.length > 0 && (
              <Badge variant="secondary" className="text-[11px] font-semibold tabular-nums">
                {scans.length} {scans.length === 1 ? "scan" : "scans"}
              </Badge>
            )}
          </div>

          {scans && scans.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll((prev) => !prev)}
              className="h-8 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              {showAll ? (
                <>
                  Show Less <ChevronUp className="ml-1 h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  View All ({scans.length}) <ChevronDown className="ml-1 h-3.5 w-3.5" />
                </>
              )}
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Quickly review or re-inspect previously analyzed food labels.
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {scans === null && (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span>Loading recent scan history…</span>
          </div>
        )}

        {error && (
          <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
            {error}
          </p>
        )}

        {scans !== null && scans.length === 0 && !error && guest && (
          <div className="rounded-xl border border-dashed p-6 text-center">
            <p className="text-xs font-semibold text-foreground">
              Guest mode — nothing is stored for you
            </p>
            <p className="mt-1 max-w-sm text-[11px] leading-relaxed text-muted-foreground">
              Scans you run without an account are analyzed but never saved to the database, so
              there is no history to show.
            </p>
            <Button asChild size="sm" variant="outline" className="mt-3 h-8 text-xs">
              <Link href="/sign-up">Create an account</Link>
            </Button>
          </div>
        )}

        {scans !== null && scans.length === 0 && !error && !guest && (
          <div className="rounded-xl border border-dashed p-6 text-center">
            <p className="text-xs font-semibold text-foreground">No food scans recorded yet</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Upload or snap a product label below to see your first verified report here.
            </p>
          </div>
        )}

        {scans && scans.length > 0 && (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {displayedScans.map((s) => {
              const isActive = activeScanId === s.id
              return (
                <div
                  key={s.id}
                  onClick={() => onSelectScan?.(s.id)}
                  className={`group relative flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all ${
                    onSelectScan ? "cursor-pointer hover:border-primary/40 hover:shadow-xs" : ""
                  } ${isActive ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "bg-card hover:bg-muted/20"}`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {s.productName ?? "Unnamed Food"}
                      </span>
                      {s.category && (
                        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold capitalize text-muted-foreground">
                          {s.category}
                        </span>
                      )}
                    </div>
                    {s.brand && (
                      <p className="text-xs font-medium text-muted-foreground line-clamp-1">{s.brand}</p>
                    )}
                    <p className="text-[11px] text-muted-foreground/80 line-clamp-2 leading-relaxed">
                      {s.summary}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t pt-2.5 text-[11px]">
                    <time className="tabular-nums text-muted-foreground">
                      {new Date(s.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                    <div className="flex items-center gap-1">
                      <Button
                        asChild
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-[11px] font-semibold"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link href={`/scan/${s.id}`}>
                          Inspect <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Delete scan"
                        disabled={busyId === s.id}
                        onClick={(e) => void remove(e, s.id)}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      >
                        {busyId === s.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
