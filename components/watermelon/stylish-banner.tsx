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
              className="flex items-center gap-2 rounded-full border bg-background px-3.5 py-1 text-xs font-semibold shadow-2xs transition-colors hover:bg-accent"
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
