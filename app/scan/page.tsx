"use client"

import * as React from "react"
import Link from "next/link"
import {
  ScanLine,
  RotateCcw,
  Sparkles,
  History,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ImageUploader } from "@/components/label-lens/image-uploader"
import { ReportView } from "@/components/label-lens/report-view"
import { AskYourLabel } from "@/components/label-lens/ask-your-label"
import { ScanHistory } from "@/components/label-lens/scan-history"
import type { ScanRecord } from "@/lib/types"

export default function ScanPage() {
  const [scan, setScan] = React.useState<ScanRecord | null>(null)
  const [saved, setSaved] = React.useState(true)
  const [refreshKey, setRefreshKey] = React.useState(0)

  const onAnalyzed = (next: ScanRecord, wasSaved: boolean) => {
    setScan(next)
    setSaved(wasSaved)
    setRefreshKey((k) => k + 1)
  }

  const onSelectScanFromHistory = async (id: string) => {
    try {
      const res = await fetch(`/api/scans/${id}`)
      const data = await res.json()
      if (res.ok && data.success && data.scan) {
        setScan(data.scan as ScanRecord)
        setSaved(true)
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
    } catch {
      // fallback
    }
  }

  return (
    <div className="container max-w-6xl space-y-8 py-8 animate-in fade-in-50 duration-200">
      {/* Page Title & Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-2xs">
              <ScanLine className="h-5 w-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Food Label Scanner
            </h1>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/25">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
              In-Memory Truth Verification
            </span>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Drop or snap a photo of any nutrition table or ingredient list. LabelLens rigorously isolates printed facts directly from physical packaging.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button asChild variant="outline" size="sm" className="h-8.5 gap-1.5 text-xs font-semibold">
            <Link href="/history">
              <History className="h-3.5 w-3.5 text-primary" />
              <span>View History</span>
            </Link>
          </Button>

          {scan && (
            <Button
              variant="default"
              size="sm"
              onClick={() => setScan(null)}
              className="h-8.5 gap-1.5 text-xs font-bold"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Scan Another Item</span>
            </Button>
          )}
        </div>
      </div>

      {/* RECENT SCANS ON TOP */}
      <div className="space-y-2">
        <ScanHistory
          refreshKey={refreshKey}
          onSelectScan={onSelectScanFromHistory}
          activeScanId={scan?.id}
        />
      </div>

      {/* DRAG AND DROP FOOD SCANNER */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
              +
            </span>
            Drag & Drop Food Label
          </h2>
          <span className="text-xs text-muted-foreground">
            JPG, PNG, WEBP up to 5 MB · 0% Image Retention
          </span>
        </div>
        <ImageUploader onAnalyzed={onAnalyzed} />
      </div>

      {/* ANALYSIS RESULTS DASHBOARD WITH "IS IT PERFECT TO EAT?" VERDICT */}
      {scan ? (
        <section className="space-y-6 pt-4 animate-in fade-in-50 duration-300">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
            <div>
              <h3 className="text-lg font-bold text-foreground">
                Analysis Report: <span className="text-primary">{scan.report.productName ?? "Scanned Food"}</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Grounded multimodal inspection completed with Label Truth Mode.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {saved && (
                <Badge variant="outline" className="font-mono text-xs">
                  ID: {scan.id.slice(0, 8)}
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setScan(null)}
                className="h-8 gap-1.5 text-xs font-semibold"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Scan Another
              </Button>
            </div>
          </div>

          {!saved && (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
              <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
              <span>
                Guest mode: this report is real, but nothing has been stored. Sign in to keep it in
                your history.
              </span>
              <Link href="/sign-in" className="font-semibold underline underline-offset-2">
                Sign in
              </Link>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <ReportView report={scan.report} />
            </div>
            <div className="space-y-6">
              <AskYourLabel
                key={scan.id || "guest"}
                scanId={scan.id}
                report={saved ? undefined : scan.report}
              />
            </div>
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed bg-muted/20 p-10 text-center transition-colors">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-background border shadow-xs">
            <ScanLine className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-base font-bold text-foreground">Waiting for a food label</h3>
          <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground leading-relaxed">
            Drag and drop a food label photo above or take a picture with your phone. The analysis will establish whether the item is clean and perfect to eat.
          </p>
        </section>
      )}

      {/* Footer */}
      <footer className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-8 pb-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          <p>
            LabelLens is an informational transparency tool. It does not provide medical diagnosis.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 font-medium font-mono text-[11px]">
          <span>Gemma Multimodal + Watermelon UI</span>
        </div>
      </footer>
    </div>
  )
}

