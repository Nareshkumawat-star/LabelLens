"use client"

import * as React from "react"
import Link from "next/link"
import { History, Trash2, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
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
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5 text-primary" /> Scan history
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Shared, unauthenticated demo data — this is not per-user isolation.
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {scans === null && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </p>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        {scans !== null && scans.length === 0 && !error && (
          <p className="text-sm text-muted-foreground">No scans yet.</p>
        )}

        {scans?.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between gap-3 rounded-lg border p-3"
          >
            <div className="min-w-0">
              <Link href={`/scan/${s.id}`} className="truncate font-medium hover:underline">
                {s.productName ?? "Unnamed product"}
              </Link>
              <p className="truncate text-xs text-muted-foreground">
                {[s.brand, s.category, new Date(s.createdAt).toLocaleString()].filter(Boolean).join(" · ")}
              </p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Delete scan"
              disabled={busyId === s.id}
              onClick={() => void remove(s.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
