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
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StylishBanner } from "@/components/watermelon/stylish-banner"
import { WatermelonFaqAccordion } from "@/components/watermelon/watermelon-faq-accordion"

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
              Scan any food label to uncover hidden additives, verify printed nutrition facts, and receive an instant{" "}
              <strong className="text-foreground font-semibold">&ldquo;Is It Perfect to Eat?&rdquo;</strong> edibility verdict with zero guesswork.
            </p>

            {/* BUTTON: WHEN CLICKED, OPENS THE SECOND PAGE (/scan) */}
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
              <div className="text-[11px] font-medium text-muted-foreground">Image Retention</div>
              <div className="text-sm font-bold tabular-nums text-emerald-700 dark:text-emerald-400">0% (In-Memory)</div>
            </div>
          </div>
        </div>

        {/* DETAILS REGARDING LABELLENS — 4 CORE VERIFICATION PILLARS */}
        <div id="pillars" className="space-y-4 pt-2">
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

      {/* 2. SECOND PAGE LAUNCHER CARD */}
      <section className="rounded-2xl border bg-gradient-to-br from-card via-card to-muted/30 p-8 sm:p-10 shadow-xs space-y-6">
        <div className="max-w-2xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              <Award className="h-3.5 w-3.5" />
              Instant Nutrition Intelligence
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Ready to test your packaged food?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Open the dedicated food scanner page to drag & drop any product label, review previous scans directly on top, and get an authoritative edibility verdict.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button asChild size="lg" className="h-11 px-6 font-bold gap-2 shadow-xs">
            <Link href="/scan">
              <ScanLine className="h-4.5 w-4.5" />
              Open Food Scanner Page
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-11 px-5 font-semibold gap-2">
            <Link href="/history">
              <History className="h-4.5 w-4.5 text-primary" />
              Review Scan History
            </Link>
          </Button>
        </div>
      </section>

      {/* 3. WATERMELON CARD-SPLIT FAQ & ARCHITECTURE ACCORDION */}
      <section className="pt-2">
        <WatermelonFaqAccordion />
      </section>

      {/* 4. FOOTER */}
      <footer className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-8 pb-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          <p>
            LabelLens is an informational transparency tool. It does not provide medical diagnosis and does not classify products as healthy or unsafe.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 font-medium font-mono text-[11px]">
          <span>Gemma Multimodal + Watermelon UI</span>
        </div>
      </footer>
    </div>
  )
}
