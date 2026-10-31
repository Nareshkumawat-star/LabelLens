"use client"

import * as React from "react"
import Link from "next/link"
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
  History,
  Layers,
  Award,
  Camera,
  Check,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StylishBanner } from "@/components/watermelon/stylish-banner"
import { WatermelonFaqAccordion } from "@/components/watermelon/watermelon-faq-accordion"
import { InteractiveLabelSimulator } from "@/components/label-lens/interactive-label-simulator"

export default function IndexPage() {
  return (
    <div className="container max-w-6xl space-y-14 py-10">
      {/* 1. HERO SECTION */}
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
                Multimodal Vision AI
              </Badge>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/25">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
                Truth Mode Active
              </span>
            </div>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Understand what is <strong className="text-foreground font-semibold">really printed inside</strong> your packaged food.
              Scan any food label to uncover hidden additives, verify printed claims, and get an instant{" "}
              <strong className="text-foreground font-semibold">&ldquo;Is It Perfect to Eat?&rdquo;</strong> edibility verdict with zero guesswork.
            </p>

            {/* PRIMARY ACTION BUTTONS */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                asChild
                size="lg"
                className="h-12 px-6 text-sm font-bold shadow-md shadow-primary/20 gap-2 cursor-pointer transition-all hover:scale-102"
              >
                <Link href="/scan">
                  <ScanLine className="h-5 w-5" />
                  Check Food Label Now
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 px-5 text-sm font-semibold gap-1.5"
              >
                <Link href="/history">
                  <History className="h-4 w-4 text-primary" />
                  View Scan History
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex flex-row md:flex-col items-end gap-2.5 shrink-0">
            <div className="rounded-xl border bg-card p-3 shadow-xs text-right min-w-[155px]">
              <div className="text-[11px] font-medium text-muted-foreground">Detection Engine</div>
              <div className="text-sm font-bold text-foreground">Gemma Multimodal</div>
            </div>
            <div className="rounded-xl border bg-card p-3 shadow-xs text-right min-w-[155px]">
              <div className="text-[11px] font-medium text-muted-foreground">Privacy Protection</div>
              <div className="text-sm font-bold tabular-nums text-emerald-700 dark:text-emerald-400">0% (In-Memory)</div>
            </div>
          </div>
        </div>

        {/* 2. THE 4-STAGE ARCHITECTURAL PIPELINE RIBBON (NOT CARDS!) */}
        <div className="rounded-2xl border bg-muted/20 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Verification Pipeline
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="h-3.5 w-3.5" /> 100% Grounded in Physical Label
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-border/60">
            <div className="space-y-1 pt-3 md:pt-0 md:pr-4">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary font-mono">
                  1
                </span>
                <span className="text-sm font-bold text-foreground">Snap Packaging</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed pl-8">
                Take a photo of any label or nutrition panel. Evaluated strictly in-memory.
              </p>
            </div>

            <div className="space-y-1 pt-3 md:pt-0 md:px-4">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary font-mono">
                  2
                </span>
                <span className="text-sm font-bold text-foreground">Verbatim OCR</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed pl-8">
                Extracts physical text as-is. Printed ingredients are isolated from AI context.
              </p>
            </div>

            <div className="space-y-1 pt-3 md:pt-0 md:px-4">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary font-mono">
                  3
                </span>
                <span className="text-sm font-bold text-foreground">Additive Radar</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed pl-8">
                Unmasks hidden chemical emulsifiers, synthetic dyes, and Big-9 allergens.
              </p>
            </div>

            <div className="space-y-1 pt-3 md:pt-0 md:pl-4">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  4
                </span>
                <span className="text-sm font-bold text-foreground">&ldquo;Perfect to Eat?&rdquo;</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed pl-8">
                Calculates edibility purity score so you know if it is clean or ultra-processed.
              </p>
            </div>
          </div>
        </div>

        {/* WATERMELON MARQUEE TICKER */}
        <StylishBanner />
      </header>

      {/* 3. INTERACTIVE SIMULATOR (DIFFERENT MANNER: INTERACTIVE LIVE LABELS, NOT CARDS!) */}
      <section>
        <InteractiveLabelSimulator />
      </section>

      {/* 4. SECOND PAGE LAUNCHER BANNER */}
      <section className="relative overflow-hidden rounded-2xl border bg-card p-8 sm:p-10 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              <ScanLine className="h-3.5 w-3.5" />
              Scan Ready
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Ready to verify a real food in your kitchen?
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Open the dedicated food scanner page to drag & drop any packaging photo. Get an immediate edibility verdict and review your history on top.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button asChild size="lg" className="h-11 px-6 font-bold gap-2 shadow-xs">
              <Link href="/scan">
                <ScanLine className="h-4.5 w-4.5" />
                Open Food Scanner Page
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-11 px-5 font-semibold gap-2">
              <Link href="/history">
                <History className="h-4.5 w-4.5 text-primary" />
                History
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 5. WATERMELON CARD-SPLIT FAQ & ARCHITECTURE ACCORDION */}
      <section className="pt-2">
        <WatermelonFaqAccordion />
      </section>

      {/* 6. FOOTER */}
      <footer className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-8 pb-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          <p>
            LabelLens is an informational transparency tool. It does not provide medical advice and does not classify products as healthy or unsafe.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 font-medium font-mono text-[11px]">
          <span>Gemma Multimodal + Watermelon UI</span>
        </div>
      </footer>
    </div>
  )
}
