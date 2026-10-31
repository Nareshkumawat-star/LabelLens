"use client"

import * as React from "react"
import {
  ScanLine,
  Sparkles,
  ShieldCheck,
  Cpu,
  ArrowRight,
  Eye,
  HeartHandshake,
  CheckCircle2,
  Lock,
  RotateCcw,
  Layers,
} from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ImageUploader } from "@/components/label-lens/image-uploader"
import { ReportView } from "@/components/label-lens/report-view"
import { AskYourLabel } from "@/components/label-lens/ask-your-label"
import { ScanHistory } from "@/components/label-lens/scan-history"
import { StylishBanner } from "@/components/watermelon/stylish-banner"
import { WatermelonFaqAccordion } from "@/components/watermelon/watermelon-faq-accordion"
import type { ScanRecord, ScanDetail } from "@/lib/types"

const DETAILS_PILLARS = [
  {
    icon: HeartHandshake,
    title: '"Is It Perfect to Eat?" Verdict',
    desc: "Immediately calculates edibility purity, additive loads, and sugar thresholds so you know if food is clean, wholesome, or ultra-processed.",
    badge: "Instant Decision",
    color: "border-emerald-500/30 bg-emerald-500/5",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: Eye,
    title: "100% Label Truth Mode",
    desc: "Rigid segregation between physical packaging OCR, AI nutritional explanations, and unverified data. Zero AI hallucinations.",
    badge: "Truth Guarantee",
    color: "border-blue-500/30 bg-blue-500/5",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: ShieldCheck,
    title: "Additives & Allergen Radar",
    desc: "Unmasks hidden chemicals, synthetic dyes (Red 40, Yellow 5), high-fructose corn syrups, and the Big-9 common allergens.",
    badge: "Safety Scanner",
    color: "border-amber-500/30 bg-amber-500/5",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    icon: Lock,
    title: "Ephemeral In-Memory Privacy",
    desc: "Photos are processed in temporary RAM buffers and permanently purged once analyzed. Zero photo storage on servers.",
    badge: "0% Retention",
    color: "border-purple-500/30 bg-purple-500/5",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
]

export default function IndexPage() {
  const [scan, setScan] = React.useState<ScanRecord | null>(null)
  const [refreshKey, setRefreshKey] = React.useState(0)
  const [loadingHistoryScan, setLoadingHistoryScan] = React.useState(false)

  const scannerRef = React.useRef<HTMLDivElement>(null)

  const scrollToScanner = () => {
    scannerRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const onAnalyzed = (next: ScanRecord) => {
    setScan(next)
    setRefreshKey((k) => k + 1)
  }

  const onSelectScanFromHistory = async (id: string) => {
    setLoadingHistoryScan(true)
    try {
      const res = await fetch(`/api/scans/${id}`)
      const data = await res.json()
      if (res.ok && data.success && data.scan) {
        setScan(data.scan as ScanRecord)
        scrollToScanner()
      }
    } catch {
      // fallback
    } finally {
      setLoadingHistoryScan(false)
    }
  }

  return (
    <div className="container max-w-6xl space-y-12 py-10">
      {/* 1. HERO HEADER WITH DETAILS REGARDING LABELLENS */}
      <header className="relative space-y-8 border-b pb-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-4 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-lg font-black text-primary-foreground shadow-xs">
                L
              </span>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
                LabelLens
              </h1>
              <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5 border-primary/25 bg-primary/5">
                Multimodal AI
              </Badge>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/25">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
                Truth Mode Active
              </span>
            </div>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Understand what is <strong className="text-foreground font-semibold">really inside</strong> your packaged food.
              Scan any label to uncover hidden additives, verify nutrition claims, and get an instant{" "}
              <strong className="text-foreground font-semibold">&ldquo;Is It Perfect to Eat?&rdquo;</strong> health verdict with zero guesswork.
            </p>

            {/* CHECK FOOD LABEL BUTTON & CTA ACTIONS */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                size="lg"
                onClick={scrollToScanner}
                className="h-12 px-6 text-sm font-bold shadow-md shadow-primary/20 gap-2 cursor-pointer transition-all hover:scale-102"
              >
                <ScanLine className="h-5 w-5" />
                Check Food Label Now
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 px-5 text-sm font-semibold"
              >
                <a href="#how-it-works">
                  How LabelLens Works <ArrowRight className="ml-1.5 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          <div className="flex flex-row md:flex-col items-end gap-2.5 shrink-0">
            <div className="rounded-xl border bg-card p-3 shadow-xs text-right min-w-[150px]">
              <div className="text-[11px] font-medium text-muted-foreground">Vision Engine</div>
              <div className="text-sm font-bold text-foreground">Gemma Multimodal</div>
            </div>
            <div className="rounded-xl border bg-card p-3 shadow-xs text-right min-w-[150px]">
              <div className="text-[11px] font-medium text-muted-foreground">Privacy Protection</div>
              <div className="text-sm font-bold tabular-nums text-emerald-700 dark:text-emerald-400">0% Image Storage</div>
            </div>
          </div>
        </div>

        {/* DETAILS REGARDING LABELLENS — 4 CORE PILLARS */}
        <div id="how-it-works" className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              What LabelLens Inspects For You
            </h2>
            <span className="text-xs text-muted-foreground font-medium">
              4-Point Truth Verification
            </span>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {DETAILS_PILLARS.map((pillar, idx) => {
              const Icon = pillar.icon
              return (
                <div
                  key={idx}
                  className={`rounded-xl border p-4.5 space-y-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs ${pillar.color}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border bg-background shadow-2xs">
                      <Icon className={`h-4.5 w-4.5 ${pillar.iconColor}`} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-background/80 border px-2 py-0.5 rounded-full">
                      {pillar.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{pillar.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{pillar.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* WATERMELON MARQUEE & LIVE CAPABILITY TICKER */}
        <StylishBanner />
      </header>

      {/* 2. SCANNER WORKBENCH WITH HISTORY ON TOP */}
      <section ref={scannerRef} id="scanner-section" className="space-y-6 scroll-mt-20">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
              <ScanLine className="h-6 w-6 text-primary" />
              Food Label Scanner
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review your recent scans on top, or drag & drop any product label below to uncover what&apos;s really inside.
            </p>
          </div>

          {scan && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScan(null)}
              className="text-xs font-semibold gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Scan Another Label
            </Button>
          )}
        </div>

        {/* ON TOP: SHOW RECENT SCAN HISTORY */}
        <div className="space-y-2">
          <ScanHistory
            refreshKey={refreshKey}
            onSelectScan={onSelectScanFromHistory}
            activeScanId={scan?.id}
          />
        </div>

        {/* IMMEDIATELY BELOW: DRAG & DROP FOOD UPLOADER */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                +
              </span>
              Upload New Food Label
            </h3>
            <span className="text-[11px] text-muted-foreground">
              JPG, PNG, WEBP · up to 5 MB
            </span>
          </div>
          <ImageUploader onAnalyzed={onAnalyzed} />
        </div>

        {/* 3. ANALYSIS RESULTS VIEW WITH "IS IT PERFECT TO EAT?" VERDICT */}
        {scan ? (
          <div className="space-y-6 pt-4 animate-in fade-in-50 duration-300">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-foreground">
                Analysis for: <span className="text-primary">{scan.report.productName ?? "Scanned Food"}</span>
              </h3>
              <Badge variant="outline" className="text-xs font-mono">
                Scan ID: {scan.id.slice(0, 8)}
              </Badge>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <ReportView report={scan.report} />
              </div>
              <div className="space-y-6">
                <AskYourLabel scanId={scan.id} />
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed bg-muted/20 p-10 text-center transition-colors">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-background border shadow-xs">
              <ScanLine className="h-6 w-6 text-muted-foreground" />
            </div>
            <h4 className="mt-4 text-base font-bold text-foreground">Ready to analyze</h4>
            <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground leading-relaxed">
              Drag and drop any food or beverage label above. Gemma will extract verbatim printed ingredients,
              unmask additives, and evaluate if it is perfect to eat.
            </p>
          </div>
        )}
      </section>

      {/* 4. WATERMELON CARD-SPLIT FAQ & ARCHITECTURE ACCORDION */}
      <section className="pt-4">
        <WatermelonFaqAccordion />
      </section>

      {/* 5. FOOTER */}
      <footer className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-8 pb-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          <p>
            LabelLens is an informational transparency tool. It does not provide medical advice and does not replace professional dietary guidance.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 font-medium font-mono text-[11px]">
          <span>Powered by Gemma + Watermelon UI</span>
        </div>
      </footer>
    </div>
  )
}
