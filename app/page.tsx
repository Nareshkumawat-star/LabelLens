"use client"

import * as React from "react"
import { ScanLine, Sparkles, ShieldCheck, Zap } from "lucide-react"

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
    <div className="container max-w-6xl space-y-10 py-8">
      {/* Stylish Hero Header */}
      <header className="relative space-y-4 border-b pb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-xl font-black text-primary-foreground shadow-md shadow-primary/20">
                L
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text">
                LabelLens
              </h1>
              <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5 border-primary/30 bg-primary/5">
                multimodal AI
              </Badge>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Truth Mode Active
              </span>
            </div>
            <p className="max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
              Understand what&apos;s really inside your packaged food. Scan any label to separate printed ingredients,
              AI explanations, and unverified information with zero guesswork.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <div className="rounded-xl border bg-card/60 p-3 shadow-xs text-right">
              <div className="text-[11px] font-medium text-muted-foreground">Detection Engine</div>
              <div className="text-sm font-bold text-foreground">Gemma Multimodal</div>
            </div>
            <div className="rounded-xl border bg-card/60 p-3 shadow-xs text-right">
              <div className="text-[11px] font-medium text-muted-foreground">Image Retention</div>
              <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">0% (In-Memory)</div>
            </div>
          </div>
        </div>

        {/* Watermelon Animated Ticker & Feature Highlights */}
        <StylishBanner />
      </header>

      {/* Upload Zone */}
      <section className="space-y-4">
        <ImageUploader onAnalyzed={onAnalyzed} />
      </section>

      {/* Analysis Results View */}
      {scan ? (
        <section className="space-y-6">
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
        <section className="rounded-2xl border border-dashed bg-muted/20 p-10 text-center transition-all">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted shadow-inner">
            <ScanLine className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-foreground">No label analyzed yet</h3>
          <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground leading-relaxed">
            Upload or photograph any food or beverage label above. The photo will be parsed by our
            multimodal vision model and verified under Label Truth Mode.
          </p>
        </section>
      )}

      {/* Watermelon Card-Split Accordion: Interactive FAQ & Verification Guide */}
      <section className="pt-2">
        <WatermelonFaqAccordion />
      </section>

      {/* Scan History */}
      <section>
        <ScanHistory refreshKey={refreshKey} />
      </section>

      {/* Footer */}
      <footer className="flex flex-wrap items-center justify-between gap-4 border-t pt-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>
            LabelLens is an informational tool. It is not medical advice, and it does not judge whether a product is safe or healthy.
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span>Powered by Gemma + Watermelon UI</span>
        </div>
      </footer>
    </div>
  )
}
