"use client"

import * as React from "react"
import {
  Eye,
  Sparkles,
  AlertTriangle,
  HelpCircle,
  Check,
  X,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Info,
  Heart,
  Flame,
  Award,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ProductReport, TruthMode } from "@/lib/types"

interface Props {
  report: ProductReport
}

// ---------------------------------------------------------------------------
// Eatability & Quality Evaluation Engine
// ---------------------------------------------------------------------------
interface EatabilityAssessment {
  status: "perfect" | "good" | "moderate" | "caution"
  title: string
  badgeText: string
  score: number // out of 100
  headline: string
  reasons: string[]
  cautions: string[]
  metrics: {
    label: string
    value: string
    tone: "good" | "warn" | "caution"
    icon: React.ReactNode
  }[]
}

function evaluateEatability(report: ProductReport): EatabilityAssessment {
  const n = report.nutrition
  const allergens = report.allergens || []
  const warnings = report.warnings || []
  const additives = (report.ingredients || []).filter((i) => i.flag === "additive")
  const highSugars = (report.ingredients || []).filter((i) => i.flag === "high-sugar")
  const highSodium = (report.ingredients || []).filter((i) => i.flag === "high-sodium")

  const sugarsNum = n?.sugars ? parseFloat(n.sugars.replace(/[^0-9.]/g, "")) : null
  const sodiumNum = n?.sodium ? parseFloat(n.sodium.replace(/[^0-9.]/g, "")) : null

  const isExcessiveSugar = highSugars.length > 0 || (sugarsNum !== null && sugarsNum > 15)
  const isExcessiveSodium = highSodium.length > 0 || (sodiumNum !== null && sodiumNum > 600)
  const hasAdditives = additives.length > 0
  const hasAllergens = allergens.length > 0
  const hasWarnings = warnings.length > 0

  const metrics: EatabilityAssessment["metrics"] = []
  const reasons: string[] = []
  const cautions: string[] = []

  // 1. Allergen Metric
  if (!hasAllergens) {
    metrics.push({
      label: "Allergen Safety",
      value: "0 Declared Allergens",
      tone: "good",
      icon: <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />,
    })
    reasons.push("Free of Big-9 food allergens on the printed package.")
  } else {
    metrics.push({
      label: "Allergens",
      value: `${allergens.length} Declared (${allergens.slice(0, 2).join(", ")}${allergens.length > 2 ? "…" : ""})`,
      tone: "caution",
      icon: <ShieldAlert className="h-4 w-4 text-rose-600 dark:text-rose-400" />,
    })
    cautions.push(`Contains declared allergens: ${allergens.join(", ")}.`)
  }

  // 2. Additive & Preservative Metric
  if (!hasAdditives) {
    metrics.push({
      label: "Chemical Additives",
      value: "Clean (0 Detected)",
      tone: "good",
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />,
    })
    reasons.push("Zero synthetic preservatives, artificial dyes, or chemical emulsifiers.")
  } else {
    metrics.push({
      label: "Additives & Dyes",
      value: `${additives.length} Flagged`,
      tone: "warn",
      icon: <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
    })
    cautions.push(`Contains ${additives.length} industrial food additive(s) or preservatives.`)
  }

  // 3. Sugar Content
  if (!isExcessiveSugar) {
    metrics.push({
      label: "Sugar Profile",
      value: sugarsNum !== null ? `${sugarsNum}g (Balanced)` : "Balanced / Low",
      tone: "good",
      icon: <Heart className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />,
    })
    reasons.push("Balanced sugar levels without high-fructose corn syrups.")
  } else {
    metrics.push({
      label: "Sugar Content",
      value: sugarsNum !== null ? `${sugarsNum}g (Elevated)` : "High Added Sugar",
      tone: "warn",
      icon: <Flame className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
    })
    cautions.push("Elevated sugar content. Best enjoyed in moderation.")
  }

  // 4. Sodium & Advisories
  if (!isExcessiveSodium && !hasWarnings) {
    metrics.push({
      label: "Salt & Warnings",
      value: sodiumNum !== null ? `${sodiumNum}mg (Safe)` : "Clean Profile",
      tone: "good",
      icon: <Award className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />,
    })
    reasons.push("Sodium and packaging statements meet standard dietary thresholds.")
  } else {
    metrics.push({
      label: "Advisories",
      value: hasWarnings ? "Printed Warning" : "High Sodium",
      tone: "warn",
      icon: <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
    })
    if (hasWarnings) cautions.push(...warnings)
    if (isExcessiveSodium) cautions.push("High sodium content per serving.")
  }

  // Classification Logic
  if (!hasAllergens && !hasWarnings && !hasAdditives && !isExcessiveSugar && !isExcessiveSodium) {
    return {
      status: "perfect",
      title: "100% Perfect to Eat — Clean & Wholesome",
      badgeText: "🌟 Perfect to Eat",
      score: 98,
      headline:
        "High nutritional purity! This food has a clean ingredient list with zero detected synthetic preservatives, chemical dyes, or declared allergens. Highly recommended for daily consumption.",
      reasons,
      cautions,
      metrics,
    }
  }

  if (!hasAllergens && !hasWarnings && additives.length <= 1 && !isExcessiveSugar) {
    return {
      status: "good",
      title: "Safe & Wholesome to Eat — Minimally Processed",
      badgeText: "✓ Safe to Eat",
      score: 86,
      headline:
        "Wholesome food with minimal industrial processing and zero critical allergen warnings. Safe and nutritious for everyday eating.",
      reasons,
      cautions,
      metrics,
    }
  }

  if (!hasAllergens && (hasAdditives || isExcessiveSugar || isExcessiveSodium)) {
    return {
      status: "moderate",
      title: "Eat in Moderation — Processed Ingredients",
      badgeText: "⚠️ Eat in Moderation",
      score: 68,
      headline:
        "Contains elevated sugars, sodium, or synthetic emulsifiers/preservatives. Best enjoyed as an occasional snack rather than a core whole-food meal.",
      reasons,
      cautions,
      metrics,
    }
  }

  return {
    status: "caution",
    title: "Review Before Eating — Allergens or Warnings Present",
    badgeText: "🛑 Review Before Eating",
    score: 52,
    headline:
      "Declared food allergens or printed package warnings were identified on this label. Review the ingredients carefully if you have dietary restrictions or sensitivities.",
    reasons,
    cautions,
    metrics,
  }
}

// ---------------------------------------------------------------------------
// Section helper for Label Truth Mode
// ---------------------------------------------------------------------------
function Section({
  title,
  items,
  empty,
  tone = "default",
}: {
  title: string
  items: string[]
  empty: string
  tone?: "default" | "warning"
}) {
  return (
    <div className="space-y-1.5">
      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</h4>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">{empty}</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((item, i) => (
            <li
              key={i}
              className={
                tone === "warning"
                  ? "flex items-start gap-2 rounded-md bg-amber-500/10 p-2 text-amber-900 dark:text-amber-200"
                  : "flex items-start gap-2 text-foreground"
              }
            >
              {tone === "warning" && (
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
              )}
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function ReportView({ report }: Props) {
  const [mode, setMode] = React.useState<TruthMode>("on-label")
  const n = report.nutrition
  const verdict = evaluateEatability(report)

  const nutritionRows: Array<[string, string | null]> = n
    ? [
        ["Serving size", n.servingSize],
        ["Servings per container", n.servingsPerContainer],
        ["Energy (Calories)", n.calories],
        ["Protein", n.protein],
        ["Total Carbohydrates", n.carbohydrates],
        ["Sugars", n.sugars],
        ["Total Fat", n.fat],
        ["Saturated Fat", n.saturatedFat],
        ["Sodium", n.sodium],
        ["Dietary Fibre", n.fiber],
      ]
    : []

  const verdictStyles = {
    perfect: {
      border: "border-emerald-500/40 bg-emerald-500/5",
      badge: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30",
      score: "text-emerald-700 dark:text-emerald-400",
      accent: "bg-emerald-500",
    },
    good: {
      border: "border-blue-500/40 bg-blue-500/5",
      badge: "bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/30",
      score: "text-blue-700 dark:text-blue-400",
      accent: "bg-blue-500",
    },
    moderate: {
      border: "border-amber-500/40 bg-amber-500/5",
      badge: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30",
      score: "text-amber-700 dark:text-amber-400",
      accent: "bg-amber-500",
    },
    caution: {
      border: "border-rose-500/40 bg-rose-500/5",
      badge: "bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30",
      score: "text-rose-700 dark:text-rose-400",
      accent: "bg-rose-500",
    },
  }[verdict.status]

  return (
    <div className="space-y-6">
      {/* 1. "IS IT PERFECT TO EAT?" — Prominent Edibility & Safety Verdict Card */}
      <Card className={`relative overflow-hidden border-2 ${verdictStyles.border} shadow-sm transition-all`}>
        <div className="p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-bold ${verdictStyles.badge}`}>
                  {verdict.badgeText}
                </span>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Eatability Assessment
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                {verdict.title}
              </h3>
            </div>

            <div className="flex items-center gap-3 shrink-0 rounded-xl border bg-card p-2.5 shadow-2xs">
              <div className="text-right">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase">Purity Rating</div>
                <div className={`text-2xl font-black tabular-nums ${verdictStyles.score}`}>
                  {verdict.score}
                  <span className="text-xs text-muted-foreground font-normal"> / 100</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm font-medium leading-relaxed text-foreground">
            {verdict.headline}
          </p>

          {/* 4-Pillar Diagnostic Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {verdict.metrics.map((m, idx) => (
              <div
                key={idx}
                className="rounded-xl border bg-card/80 p-3 space-y-1 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-muted-foreground">{m.label}</span>
                  {m.icon}
                </div>
                <div className="text-xs font-bold text-foreground truncate">{m.value}</div>
              </div>
            ))}
          </div>

          {/* Reasons & Cautions Breakdown */}
          <div className="grid gap-3 sm:grid-cols-2 pt-1 text-xs">
            {verdict.reasons.length > 0 && (
              <div className="rounded-xl bg-card border p-3 space-y-1.5">
                <div className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> What makes it good to eat:
                </div>
                <ul className="space-y-1 text-muted-foreground">
                  {verdict.reasons.map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {verdict.cautions.length > 0 && (
              <div className="rounded-xl bg-card border p-3 space-y-1.5">
                <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" /> What to watch out for:
                </div>
                <ul className="space-y-1 text-muted-foreground">
                  {verdict.cautions.map((c, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* 2. Product Identity & AI Summary */}
      <Card className="border bg-card shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
              {report.productName ?? "Unnamed Product"}
            </CardTitle>
            <Badge variant="secondary" className="font-semibold text-xs capitalize">
              {report.category ?? "Uncategorised"}
            </Badge>
            <Badge variant="outline" className="text-xs font-medium tabular-nums">
              Confidence: {report.confidence}
            </Badge>
          </div>
          {report.brand && <p className="text-sm font-medium text-muted-foreground">{report.brand}</p>}
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm leading-relaxed text-foreground">{report.summary}</p>
          <div className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            Summary is synthesized strictly from readable label text. It does not constitute a medical diagnosis.
          </div>
        </CardContent>
      </Card>

      {/* 3. Label Truth Mode */}
      <Card className="border bg-card shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <Eye className="h-5 w-5 text-primary shrink-0" />
              <span>Label Truth Mode</span>
            </CardTitle>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Verification Engine
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Verbatim printed text, AI explanations, and unverified data are segregated with zero bleed.
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={(v) => setMode(v as TruthMode)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="on-label" className="font-semibold text-xs sm:text-sm">
                On Label (Verbatim)
              </TabsTrigger>
              <TabsTrigger value="ai-explanation" className="font-semibold text-xs sm:text-sm">
                AI Explanation
              </TabsTrigger>
              <TabsTrigger value="not-verified" className="font-semibold text-xs sm:text-sm">
                Not Verified
              </TabsTrigger>
            </TabsList>

            <TabsContent value="on-label" className="space-y-5 pt-4">
              <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-800 dark:text-emerald-300">
                <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                Text printed directly on the physical packaging, copied verbatim without alteration.
              </div>

              <Section
                title="Ingredient List"
                items={report.onLabel.ingredientsText}
                empty="No ingredient block was legible on this label photo."
              />
              <Section
                title="Declared Allergens"
                items={report.onLabel.allergenDeclarations}
                empty="No allergen declaration was printed or legible."
              />
              <Section
                title="Printed Warnings"
                items={report.onLabel.warnings}
                empty="No warning statements were printed on this packaging."
                tone="warning"
              />
              <Section
                title="Storage Instructions"
                items={report.onLabel.storageInstructions}
                empty="Not printed on packaging."
              />
              <Section
                title="Usage Instructions"
                items={report.onLabel.usageInstructions}
                empty="Not printed on packaging."
              />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t pt-4 text-xs">
                <div className="rounded-md border p-2 bg-muted/20">
                  <div className="text-muted-foreground">Ingredients Listed</div>
                  <div className="font-semibold text-foreground">
                    {report.onLabel.ingredientsListed ? "Yes" : "No"}
                  </div>
                </div>
                <div className="rounded-md border p-2 bg-muted/20">
                  <div className="text-muted-foreground">Allergens Listed</div>
                  <div className="font-semibold text-foreground">
                    {report.onLabel.allergensListed ? "Yes" : "No"}
                  </div>
                </div>
                <div className="rounded-md border p-2 bg-muted/20">
                  <div className="text-muted-foreground">Nutrition Panel</div>
                  <div className="font-semibold text-foreground">
                    {report.onLabel.nutritionVisible ? "Visible" : "Not Visible"}
                  </div>
                </div>
                <div className="rounded-md border p-2 bg-muted/20">
                  <div className="text-muted-foreground">Expiry Date</div>
                  <div className="font-semibold tabular-nums text-foreground">
                    {report.onLabel.expiryDate ?? "Not found"}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ai-explanation" className="space-y-4 pt-4">
              <div className="flex items-center gap-2 rounded-lg bg-blue-500/10 px-3 py-2 text-xs font-medium text-blue-800 dark:text-blue-300">
                <Sparkles className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                Scientific context generated by the multimodal model. These explanations are not printed on the package.
              </div>

              {report.ingredients.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  No legible ingredients were found to explain.
                </p>
              ) : (
                <div className="space-y-3">
                  {report.ingredients.map((ing, i) => (
                    <div key={i} className="rounded-xl border bg-muted/10 p-3.5 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{ing.name}</span>
                        <Badge variant="outline" className="text-[10px] font-semibold tabular-nums">
                          {ing.confidence} confidence
                        </Badge>
                        {ing.flag !== "none" && (
                          <Badge variant="destructive" className="text-[10px] uppercase font-bold">
                            {ing.flag}
                          </Badge>
                        )}
                      </div>
                      {ing.sourceText && (
                        <p className="text-xs text-muted-foreground">
                          <span className="font-semibold">Printed:</span> {ing.sourceText}
                        </p>
                      )}
                      <p className="text-sm text-foreground leading-relaxed">{ing.explanation}</p>
                      {ing.purpose && (
                        <p className="text-xs text-muted-foreground">
                          <span className="font-semibold">Functional role:</span> {ing.purpose}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="not-verified" className="space-y-5 pt-4">
              <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-800 dark:text-amber-300">
                <HelpCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                Information that could not be authoritatively verified from the photograph provided.
              </div>
              <Section
                title="Unreadable Information"
                items={report.unreadableInformation}
                empty="Zero sections were flagged as unreadable."
              />
              <Section
                title="Missing From Label"
                items={report.missingInformation}
                empty="Zero standard disclosures were reported missing."
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 4. Nutrition Facts Table */}
      <Card className="border bg-card shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold">Nutrition Facts</CardTitle>
          <p className="text-xs text-muted-foreground">
            Extracted values per serving. Verified against label panel.
          </p>
        </CardHeader>
        <CardContent>
          {!n ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <X className="h-4 w-4 text-muted-foreground" /> No nutrition panel was readable on this label.
            </p>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <dl className="divide-y text-sm">
                {nutritionRows.map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between px-4 py-2 hover:bg-muted/30 transition-colors"
                  >
                    <dt className="text-muted-foreground font-medium">{label}</dt>
                    <dd className="font-bold tabular-nums text-foreground">{value ?? "—"}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 5. Allergens & Warnings Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border bg-card shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Declared Allergens</CardTitle>
          </CardHeader>
          <CardContent>
            {report.allergens.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">None declared on the readable label.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {report.allergens.map((a, i) => (
                  <Badge key={i} variant="secondary" className="font-semibold text-xs">
                    {a}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border bg-card shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Printed Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            {report.warnings.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">None printed on the readable label.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {report.warnings.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-amber-900 dark:text-amber-200">
                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span className="leading-relaxed">{w}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
