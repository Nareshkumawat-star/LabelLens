"use client"

import * as React from "react"
import {
  ShieldCheck,
  Eye,
  Sparkles,
  Lock,
  AlertTriangle,
  ScanLine,
  CheckCircle2,
} from "lucide-react"
import { Marquee } from "./marquee"

const TICKER_ITEMS = [
  {
    label: "LabelLens Live — Verifies Real Ingredients Printed on Packaging",
    icon: ScanLine,
    color: "text-emerald-600 dark:text-emerald-400",
  },
  {
    label: "LabelLens Live — Unmasks Hidden Sugars, Maltodextrin & Syrups",
    icon: Sparkles,
    color: "text-amber-600 dark:text-amber-400",
  },
  {
    label: "LabelLens Live — Flags Synthetic Preservatives, E-Numbers & Petroleum Dyes",
    icon: ShieldCheck,
    color: "text-rose-600 dark:text-rose-400",
  },
  {
    label: "LabelLens Live — Instant Big-9 Food Allergen Warnings",
    icon: AlertTriangle,
    color: "text-amber-600 dark:text-amber-400",
  },
  {
    label: "LabelLens Live — 100% Verbatim Physical Nutrition Table Extraction",
    icon: Eye,
    color: "text-teal-600 dark:text-teal-400",
  },
  {
    label: "LabelLens Live — Calculates 'Is It Perfect to Eat?' 0–100 Purity Score",
    icon: CheckCircle2,
    color: "text-emerald-600 dark:text-emerald-400",
  },
  {
    label: "LabelLens Live — Zero Photo Retention, 100% Private In-Memory Scanning",
    icon: Lock,
    color: "text-sky-600 dark:text-sky-400",
  },
]

export function StylishBanner() {
  return (
    <div className="relative overflow-hidden rounded-xl border bg-muted/20 py-2.5">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent z-10" />
      <Marquee speed="normal" pauseOnHover>
        {TICKER_ITEMS.map((item, idx) => {
          const Icon = item.icon
          return (
            <div
              key={idx}
              className="flex items-center gap-2 rounded-full border bg-background px-3.5 py-1 text-xs font-semibold shadow-2xs transition-colors hover:bg-accent shrink-0"
            >
              <Icon className={`h-3.5 w-3.5 ${item.color} shrink-0`} />
              <span className="text-foreground">{item.label}</span>
            </div>
          )
        })}
      </Marquee>
    </div>
  )
}

