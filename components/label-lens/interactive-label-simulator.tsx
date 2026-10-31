"use client"

import * as React from "react"
import Link from "next/link"
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Eye,
  ScanLine,
  Sparkles,
  ArrowRight,
  Info,
  Check,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface FoodSample {
  id: string
  name: string
  category: string
  marketingClaim: string
  score: number
  status: "perfect" | "moderate" | "caution"
  statusBadge: string
  headline: string
  printedIngredients: {
    name: string
    isFlagged: boolean
    flagReason?: string
  }[]
  unmaskedFindings: {
    title: string
    detail: string
    severity: "good" | "warn" | "danger"
  }[]
  allergens: string[]
  nutritionSnippet: {
    calories: string
    sugars: string
    sodium: string
    protein: string
  }
}

const SAMPLES: FoodSample[] = [
  {
    id: "snack-bar",
    name: "Apex 'Clean Protein' Almond Crisp Bar",
    category: "Nutrition Bar",
    marketingClaim: "Zero Added Sugar • All Natural Energy • High Protein",
    score: 64,
    status: "moderate",
    statusBadge: "⚠️ Eat in Moderation (Score: 64/100)",
    headline:
      "Marketing claims 'Zero Added Sugar', but packaging reveals Maltodextrin (glycemic index higher than table sugar) and chemical emulsifier E471.",
    printedIngredients: [
      { name: "Soy protein isolate", isFlagged: true, flagReason: "Common allergen (Soy)" },
      { name: "Maltodextrin", isFlagged: true, flagReason: "Hidden high-glycemic sugar substitute" },
      { name: "Almonds", isFlagged: false },
      { name: "Glycerol", isFlagged: false },
      { name: "Polydextrose", isFlagged: false },
      { name: "Mono- and diglycerides (E471)", isFlagged: true, flagReason: "Industrial chemical emulsifier" },
      { name: "Sucralose", isFlagged: true, flagReason: "Synthetic high-intensity sweetener" },
      { name: "Natural flavor", isFlagged: false },
    ],
    unmaskedFindings: [
      {
        title: "Hidden High Glycemic Spike",
        detail: "Maltodextrin causes sharp blood glucose response despite 'no added sugar' badge.",
        severity: "warn",
      },
      {
        title: "Synthetic Sweetener Detected",
        detail: "Sucralose unmasked in printed ingredients list.",
        severity: "warn",
      },
      {
        title: "Declared Allergen",
        detail: "Contains Soy & Tree Nuts (Almonds).",
        severity: "danger",
      },
    ],
    allergens: ["Soy", "Tree Nuts (Almonds)"],
    nutritionSnippet: {
      calories: "210 kcal",
      sugars: "1.2g (14g Maltodextrin)",
      sodium: "180mg",
      protein: "15g",
    },
  },
  {
    id: "fruit-drink",
    name: "BerryBurst Sparkle Drink",
    category: "Beverage",
    marketingClaim: "Made with Real Fruits • Vitamin C Enriched",
    score: 42,
    status: "caution",
    statusBadge: "🛑 High Sugar & Artificial Dye Alert (Score: 42/100)",
    headline:
      "Contains only 2% actual fruit juice. Primary sweetening comes from 34g of High Fructose Corn Syrup with Red 40 petroleum dye.",
    printedIngredients: [
      { name: "Carbonated water", isFlagged: false },
      { name: "High Fructose Corn Syrup", isFlagged: true, flagReason: "High fructose syrup linked to metabolic strain" },
      { name: "Concentrated apple juice (2%)", isFlagged: false },
      { name: "Citric acid", isFlagged: false },
      { name: "Sodium Benzoate", isFlagged: true, flagReason: "Synthetic chemical preservative" },
      { name: "Red 40 (Allura Red AC)", isFlagged: true, flagReason: "Synthetic coal-tar derived food dye" },
      { name: "Artificial flavor", isFlagged: true, flagReason: "Non-natural chemical flavoring" },
    ],
    unmaskedFindings: [
      {
        title: "Petroleum-Derived Food Dye",
        detail: "Red 40 (Allura Red) requires warning labels in several international jurisdictions.",
        severity: "danger",
      },
      {
        title: "34g Added High Fructose Corn Syrup",
        detail: "Exceeds daily recommended added sugar threshold in a single serving.",
        severity: "danger",
      },
      {
        title: "Chemical Preservative",
        detail: "Sodium Benzoate added for shelf life preservation.",
        severity: "warn",
      },
    ],
    allergens: ["None Declared"],
    nutritionSnippet: {
      calories: "160 kcal",
      sugars: "34g (High)",
      sodium: "45mg",
      protein: "0g",
    },
  },
  {
    id: "nut-butter",
    name: "Heritage Farmstone Pure Roasted Almond Butter",
    category: "Spreads & Butters",
    marketingClaim: "100% Whole Roasted Almonds • Zero Palm Oil",
    score: 98,
    status: "perfect",
    statusBadge: "🌟 100% Perfect to Eat (Score: 98/100)",
    headline:
      "100% clean whole food! Contains only dry roasted almonds and a touch of sea salt. Zero hydrogenated oils, no fillers, zero chemical preservatives.",
    printedIngredients: [
      { name: "Dry roasted whole almonds", isFlagged: false },
      { name: "Sea salt", isFlagged: false },
    ],
    unmaskedFindings: [
      {
        title: "100% Clean Whole Ingredient Profile",
        detail: "Zero synthetic emulsifiers, zero hydrogenated palm fats.",
        severity: "good",
      },
      {
        title: "Natural Nutrition Balance",
        detail: "Rich in plant protein, dietary fiber, and heart-healthy unsaturated fats.",
        severity: "good",
      },
      {
        title: "Declared Allergen",
        detail: "Tree nuts (Almonds). Safe for non-allergic consumers.",
        severity: "warn",
      },
    ],
    allergens: ["Tree Nuts (Almonds)"],
    nutritionSnippet: {
      calories: "190 kcal",
      sugars: "1g (Natural)",
      sodium: "35mg",
      protein: "7g",
    },
  },
]

export function InteractiveLabelSimulator() {
  const [activeId, setActiveId] = React.useState("snack-bar")
  const activeSample = SAMPLES.find((s) => s.id === activeId) ?? SAMPLES[0]

  const statusStyles = {
    perfect: {
      border: "border-emerald-500/40 bg-emerald-500/5",
      badge: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30",
      accent: "text-emerald-600 dark:text-emerald-400",
      scoreBg: "bg-emerald-500",
    },
    moderate: {
      border: "border-amber-500/40 bg-amber-500/5",
      badge: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30",
      accent: "text-amber-600 dark:text-amber-400",
      scoreBg: "bg-amber-500",
    },
    caution: {
      border: "border-rose-500/40 bg-rose-500/5",
      badge: "bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30",
      accent: "text-rose-600 dark:text-rose-400",
      scoreBg: "bg-rose-500",
    },
  }[activeSample.status]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
              Live Interactive Demonstration
            </span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              Package vs Reality
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-foreground mt-1">
            See How LabelLens Unmasks Packaged Food
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
            Choose a sample below to see how printed marketing claims contrast with labelled facts. These samples are fixed illustrations for the demo — they are not output from a scan of your photo. Real results always come from the Scan page.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 rounded-xl border bg-muted/30 p-1 self-start sm:self-auto">
          {SAMPLES.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveId(s.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeId === s.id
                  ? "bg-background text-foreground shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.id === "snack-bar" && "🍫 Protein Bar"}
              {s.id === "fruit-drink" && "🥤 Fruit Drink"}
              {s.id === "nut-butter" && "🥜 Almond Butter"}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Inspector View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 rounded-2xl border bg-card p-5 sm:p-7 shadow-xs">
        {/* Left Column: The Physical Packaging View (What the brand shows you) */}
        <div className="lg:col-span-5 space-y-4 rounded-xl border bg-muted/15 p-4 sm:p-5">
          <div className="flex items-center justify-between border-b pb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Physical Packaging
            </span>
            <span className="rounded-md border bg-background px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
              Verbatim Print
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">{activeSample.category}</span>
            <h3 className="text-base sm:text-lg font-bold text-foreground mt-0.5">
              {activeSample.name}
            </h3>
            <div className="mt-2 rounded-lg bg-primary/5 border border-primary/20 p-2 text-xs font-semibold text-primary">
              📢 Claim: &ldquo;{activeSample.marketingClaim}&rdquo;
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <div className="text-xs font-bold text-foreground flex items-center justify-between">
              <span>Printed Ingredients:</span>
              <span className="text-[10px] text-muted-foreground font-normal">Hover to inspect</span>
            </div>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {activeSample.printedIngredients.map((ing, i) => (
                <span
                  key={i}
                  title={ing.flagReason || "Standard ingredient"}
                  className={`rounded-md px-2 py-1 text-[11px] font-medium border transition-colors ${
                    ing.isFlagged
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300 font-semibold"
                      : "bg-background border-border text-foreground"
                  }`}
                >
                  {ing.name}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Nutrition Panel */}
          <div className="border-t pt-3 space-y-1.5">
            <div className="text-xs font-bold text-foreground">Nutrition Panel Snapshot:</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="rounded border bg-background p-1.5 text-center">
                <div className="text-muted-foreground text-[10px]">Calories</div>
                <div className="font-bold text-foreground tabular-nums">{activeSample.nutritionSnippet.calories}</div>
              </div>
              <div className="rounded border bg-background p-1.5 text-center">
                <div className="text-muted-foreground text-[10px]">Sugars</div>
                <div className="font-bold text-foreground tabular-nums">{activeSample.nutritionSnippet.sugars}</div>
              </div>
              <div className="rounded border bg-background p-1.5 text-center">
                <div className="text-muted-foreground text-[10px]">Sodium</div>
                <div className="font-bold text-foreground tabular-nums">{activeSample.nutritionSnippet.sodium}</div>
              </div>
              <div className="rounded border bg-background p-1.5 text-center">
                <div className="text-muted-foreground text-[10px]">Protein</div>
                <div className="font-bold text-foreground tabular-nums">{activeSample.nutritionSnippet.protein}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: What LabelLens Unmasks ("Is It Perfect to Eat?") */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-foreground">
                LabelLens Truth Analysis
              </span>
            </div>
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${statusStyles.badge}`}>
              {activeSample.statusBadge}
            </span>
          </div>

          {/* Verdict Box */}
          <div className={`rounded-xl border-2 ${statusStyles.border} p-4 space-y-2`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Edibility Verdict
              </span>
              <div className="flex items-center gap-1.5 text-sm font-black text-foreground tabular-nums">
                <span className={statusStyles.accent}>{activeSample.score}</span>
                <span className="text-xs text-muted-foreground font-normal">/ 100 Purity Score</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm font-medium leading-relaxed text-foreground">
              {activeSample.headline}
            </p>
          </div>

          {/* Key Unmasked Truth Findings */}
          <div className="space-y-2 pt-1">
            <div className="text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground">
              Unmasked Insights:
            </div>
            <div className="space-y-2">
              {activeSample.unmaskedFindings.map((finding, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 rounded-lg border bg-muted/20 p-2.5 text-xs"
                >
                  {finding.severity === "good" && (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                  )}
                  {finding.severity === "warn" && (
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                  )}
                  {finding.severity === "danger" && (
                    <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold text-foreground">{finding.title}</div>
                    <div className="text-muted-foreground mt-0.5 leading-relaxed">{finding.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action to test own food */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t">
            <div className="text-xs text-muted-foreground">
              Have a packaged food in your kitchen? Scan it in 5 seconds.
            </div>
            <Button asChild size="sm" className="font-bold text-xs gap-1.5 shadow-2xs">
              <Link href="/scan">
                <ScanLine className="h-3.5 w-3.5" />
                Scan Your Food Label
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

