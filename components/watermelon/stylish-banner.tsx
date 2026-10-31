"use client"

import * as React from "react"
import { ShieldCheck, Eye, Sparkles, Lock, Cpu, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Marquee } from "./marquee"
import { Badge } from "@/components/ui/badge"

const TICKER_ITEMS = [
  { label: "Gemma Multimodal Vision", icon: Cpu, color: "text-blue-500" },
  { label: "Label Truth Mode (Zero AI Hallucination)", icon: Eye, color: "text-emerald-500" },
  { label: "Optical Character Recognition (OCR)", icon: Sparkles, color: "text-purple-500" },
  { label: "Critical Allergen Alert System", icon: AlertTriangle, color: "text-amber-500" },
  { label: "Synthetic Additive & Preservative Radar", icon: ShieldCheck, color: "text-rose-500" },
  { label: "Private by Design — Zero Image Storage", icon: Lock, color: "text-sky-500" },
]

const STAT_CARDS = [
  {
    title: "Multimodal AI Vision",
    badge: "Gemma Powered",
    description: "Inspects package geometry, typography, and microscopic nutrition tables directly.",
    icon: Cpu,
    gradient: "from-blue-500/10 via-indigo-500/5 to-transparent",
    border: "group-hover:border-blue-500/50",
    badgeTone: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
  },
  {
    title: "100% Label Truth Mode",
    badge: "Strict Verification",
    description: "Printed facts, AI explanations, and unverified information are kept strictly apart.",
    icon: Eye,
    gradient: "from-emerald-500/10 via-teal-500/5 to-transparent",
    border: "group-hover:border-emerald-500/50",
    badgeTone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  },
  {
    title: "Additives & Allergens",
    badge: "Safety Radar",
    description: "Flags high-fructose syrups, synthetic dyes, emulsifiers, and hidden allergens.",
    icon: AlertTriangle,
    gradient: "from-amber-500/10 via-orange-500/5 to-transparent",
    border: "group-hover:border-amber-500/50",
    badgeTone: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  },
  {
    title: "Ephemeral Processing",
    badge: "Zero Image Retention",
    description: "Photos are evaluated in memory and discarded. Your private scans never get saved.",
    icon: Lock,
    gradient: "from-purple-500/10 via-pink-500/5 to-transparent",
    border: "group-hover:border-purple-500/50",
    badgeTone: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30",
  },
]

export function StylishBanner() {
  return (
    <div className="space-y-6">
      {/* Animated Marquee Ticker */}
      <div className="relative overflow-hidden rounded-xl border bg-muted/30 py-2.5 backdrop-blur-sm">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent z-10" />
        <Marquee speed="normal" pauseOnHover>
          {TICKER_ITEMS.map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={idx}
                className="flex items-center gap-2 rounded-full border bg-background/80 px-3.5 py-1 text-xs font-semibold shadow-xs transition-colors hover:bg-accent"
              >
                <Icon className={`h-3.5 w-3.5 ${item.color}`} />
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
              className={`group relative overflow-hidden rounded-xl border bg-card p-4.5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${card.border}`}
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-50 transition-opacity group-hover:opacity-100`}
              />
              <div className="relative space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background border shadow-xs text-foreground group-hover:scale-110 transition-transform">
                    <Icon className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${card.badgeTone}`}
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

