"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, History, ScanLine, Plus, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScanHistory } from "@/components/label-lens/scan-history"

export default function HistoryPage() {
  const [refreshKey, setRefreshKey] = React.useState(0)

  return (
    <div className="container max-w-6xl space-y-8 py-8 animate-in fade-in-50 duration-200">
      {/* Navigation Breadcrumb Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-2 text-sm">
          <Button asChild variant="ghost" size="sm" className="-ml-2 h-8 px-2 text-muted-foreground hover:text-foreground">
            <Link href="/">
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Home
            </Link>
          </Button>
          <span className="text-muted-foreground/60">/</span>
          <span className="font-semibold text-foreground">Scan History</span>
        </div>

        <Button asChild size="sm" className="h-8 gap-1.5 text-xs font-bold">
          <Link href="/scan">
            <Plus className="h-3.5 w-3.5" />
            <span>Scan New Label</span>
          </Link>
        </Button>
      </div>

      {/* Page Title & Context Header */}
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-2xs">
            <History className="h-5 w-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Food Scan History
          </h1>
        </div>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Browse all previously analyzed packaged foods, inspect additive flags, review verified truth mode reports, or remove obsolete records.
        </p>
      </div>

      {/* Main Scan History Component */}
      <div className="space-y-4">
        <ScanHistory refreshKey={refreshKey} />
      </div>

      {/* Footer */}
      <footer className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-8 pb-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          <p>
            LabelLens preserves structured JSON reports for your local inspection history. Raw image files are never stored.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 font-medium font-mono text-[11px]">
          <span>Gemma Multimodal + Watermelon UI</span>
        </div>
      </footer>
    </div>
  )
}
