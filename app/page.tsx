"use client"

import * as React from "react"
import { ScanLine, Sparkles, ShieldCheck, Cpu, ArrowUpRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { ImageUploader } from "@/components/label-lens/image-uploader"
import { ReportView } from "@/components/label-lens/report-view"
import { AskYourLabel } from "@/components/label-lens/ask-your-label"
import { ScanHistory } from "@/components/label-lens/scan-history"
import { StylishBanner } from "@/components/watermelon/stylish-banner"
import { WatermelonFaqAccordion } from "@/components/watermelon/watermelon-faq-accordion"
import type { ScanRecord } from "@/lib/types"

export default function IndexPage() {
  const [scan, setScan] = React.useState<ScanRecord | null>(null)
  const [refreshKey, setRefreshKey] = React.useState(0)

  const onAnalyzed = (next: ScanRecord) => {
    setScan(next)
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="container max-w-6xl space-y-12 py-10">
      {/* Hero Header */}
      <header className="relative space-y-6 border-b pb-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-lg font-black text-primary-foreground shadow-xs">
                L
              </span>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                LabelLens
              </h1>
              <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5 border-primary/25 bg-primary/5">
                Multimodal AI
              </Badge>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/25">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                Truth Mode Active
              </span>
            </div>
            <p className="max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
              Understand what is actually printed inside your packaged food. Scan any label to rigorously separate printed ingredients, AI explanations, and unverified data with zero guesswork.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start shrink-0">
            <div className="rounded-xl border bg-card p-3 shadow-xs text-right">
              <div className="text-[11px] font-medium text-muted-foreground">Detection Engine</div>
              <div className="text-sm font-bold text-foreground">Gemma Multimodal</div>
            </div>
            <div className="rounded-xl border bg-card p-3 shadow-xs text-right">
              <div className="text-[11px] font-medium text-muted-foreground">Image Retention</div>
              <div className="text-sm font-bold tabular-nums text-emerald-700 dark:text-emerald-400">0% (In-Memory)</div>
            </div>
          </div>
        </div>

        {/* Feature Ticker & Capability Highlights */}
        <StylishBanner />
      </header>

      {/* Upload Zone */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">Scan Product Label</h2>
            <p className="text-xs text-muted-foreground">Upload or capture a clear photo of the nutrition and ingredient panels.</p>
          </div>
        </div>
        <ImageUploader onAnalyzed={onAnalyzed} />
      </section>

      {/* Analysis Results View */}
      {scan ? (
        <section className="space-y-6 animate-in fade-in-50 duration-300">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <ReportView report={scan.report} />
            </div>
            <div className="space-y-6">
              <AskYourLabel scanId={scan.id} />
            </div>
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed bg-muted/20 p-12 text-center transition-colors">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-background border shadow-xs">
            <ScanLine className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-base font-bold text-foreground">No label analyzed yet</h3>
          <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground leading-relaxed">
            Upload or photograph any food or beverage label above. The image will be parsed in-memory by Gemma and verified under Label Truth Mode.
          </p>
        </section>
      )}

      {/* Watermelon Interactive FAQ & Verification Architecture */}
      <section className="pt-2">
        <WatermelonFaqAccordion />
      </section>

      {/* Scan History */}
      <section className="pt-2">
        <ScanHistory refreshKey={refreshKey} />
      </section>

      {/* Footer */}
      <footer className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-8 pb-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          <p>
            LabelLens is an informational transparency tool. It does not provide medical diagnosis and does not classify products as healthy or unsafe.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 font-medium">
          <span className="font-mono text-[11px]">Powered by Gemma + Watermelon UI</span>
        </div>
      </footer>
    </div>
  )
}
