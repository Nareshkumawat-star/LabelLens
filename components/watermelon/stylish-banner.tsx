"use client"

import * as React from "react"
import { ShieldCheck, Eye, Sparkles, Lock, Cpu, AlertTriangle } from "lucide-react"
import { Marquee } from "./marquee"

const TICKER_ITEMS = [
  { label: "Gemma Multimodal Vision", icon: Cpu, color: "text-blue-600 dark:text-blue-400" },
  { label: "Label Truth Mode (Zero AI Hallucination)", icon: Eye, color: "text-emerald-600 dark:text-emerald-400" },
  { label: "Optical Character Recognition (OCR)", icon: Sparkles, color: "text-purple-600 dark:text-purple-400" },
  { label: "Critical Allergen Alert System", icon: AlertTriangle, color: "text-amber-600 dark:text-amber-400" },
  { label: "Synthetic Additive & Preservative Radar", icon: ShieldCheck, color: "text-rose-600 dark:text-rose-400" },
  { label: "Private by Design — Zero Image Storage", icon: Lock, color: "text-sky-600 dark:text-sky-400" },
]

const STAT_CARDS = [
  {
    title: "Multimodal AI Vision",
    badge: "Gemma Powered",
    description: "Inspects package geometry, typography, and microscopic nutrition tables directly.",
    icon: Cpu,
    borderTone: "hover:border-blue-500/40",
    badgeTone: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/25",
  },
  {
    title: "100% Label Truth Mode",
    badge: "Strict Verification",
    description: "Printed facts, AI explanations, and unverified data are segregated with zero bleed.",
    icon: Eye,
    borderTone: "hover:border-emerald-500/40",
    badgeTone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
  },
  {
    title: "Additives & Allergens",
    badge: "Safety Radar",
    description: "Flags high-fructose syrups, synthetic dyes, chemical emulsifiers, and hidden allergens.",
    icon: AlertTriangle,
    borderTone: "hover:border-amber-500/40",
    badgeTone: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25",
  },
  {
    title: "Ephemeral Processing",
    badge: "Zero Image Retention",
    description: "Photos are evaluated in memory and discarded. Raw image files are never stored.",
    icon: Lock,
    borderTone: "hover:border-purple-500/40",
    badgeTone: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/25",
  },
]

export function StylishBanner() {
  return (
    <div className="space-y-6">
      {/* Animated Marquee Ticker */}
      <div className="relative overflow-hidden rounded-xl border bg-muted/20 py-2.5">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent z-10" />
        <Marquee speed="normal" pauseOnHover>
          {TICKER_ITEMS.map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={idx}
                className="flex items-center gap-2 rounded-full border bg-background px-3.5 py-1 text-xs font-semibold shadow-2xs transition-colors hover:bg-accent"
              >
                <Icon className={`h-3.5 w-3.5 ${item.color} shrink-0`} />
                <span className="text-foreground">{item.label}</span>
              </div>
            )
          })}
        </Marquee>
      </div>

      {/* Modern 4-Grid Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((card, idx) => {
          const Icon = card.icon
          return (
            <div
              key={idx}
              className={`group relative rounded-xl border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs ${card.borderTone}`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border bg-muted/30 text-foreground transition-colors group-hover:bg-primary/5">
                    <Icon className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold tabular-nums ${card.badgeTone}`}
                  >
                    {card.badge}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight text-foreground">
                    {card.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
