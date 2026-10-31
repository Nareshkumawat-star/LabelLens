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
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ProductReport, TruthMode } from "@/lib/types"

interface Props {
  report: ProductReport
}

// ---------------------------------------------------------------------------
// Label assessment engine
//
// This only reports what is actually legible in the photo. When a panel was
// not read, the card says so ("not readable on this image") instead of
// inferring "zero allergens" or "low sugar" from missing data.
// ---------------------------------------------------------------------------
interface EatabilityAssessment {
  status: "clear" | "moderate" | "caution" | "unknown"
  title: string
  badgeText: string
  /** Share of the four label pillars that were actually readable (0-100).
   *  This is a readability measure, NOT a health or purity score. */
  score: number
  headline: string
  /** Statements that are backed by readable label text only. */
  reasons: string[]
  cautions: string[]
  metrics: {
    label: string
    value: string
    tone: "good" | "warn" | "caution" | "unknown"
    icon: React.ReactNode
  }[]
}

const NOT_READABLE = "Not readable on this image"

function toNumber(value: string | null | undefined): number | null {
  if (!value) return null
  const parsed = Number.parseFloat(value.replace(/[^0-9.]/g, ""))
  return Number.isFinite(parsed) ? parsed : null
}

function evaluateEatability(report: ProductReport): EatabilityAssessment {
  const n = report.nutrition
  const onLabel = report.onLabel
  const allergens = report.allergens || []
  const warnings = report.warnings || []
  const ingredients = report.ingredients || []
  const additives = ingredients.filter((i) => i.flag === "additive")
  const highSugars = ingredients.filter((i) => i.flag === "high-sugar")
  const highSodium = ingredients.filter((i) => i.flag === "high-sodium")

  const sugarsNum = toNumber(n?.sugars)
  const sodiumNum = toNumber(n?.sodium)

  // What did we actually read? Anything unread stays unknown — never assumed.
  const ingredientsKnown = onLabel.ingredientsListed || ingredients.length > 0
  const allergensKnown = onLabel.allergensListed || allergens.length > 0
  const nutritionKnown = Boolean(
    n && (sugarsNum !== null || sodiumNum !== null || n.calories || n.protein || n.fat)
  )
  const warningsKnown = warnings.length > 0

  const knownCount = [ingredientsKnown, allergensKnown, nutritionKnown, warningsKnown].filter(
    Boolean
  ).length
  const coverage = Math.round((knownCount / 4) * 100)

  const metrics: EatabilityAssessment["metrics"] = []
  const reasons: string[] = []
  const cautions: string[] = []

  // 1. Allergens -------------------------------------------------------------
  if (!allergensKnown) {
    metrics.push({
      label: "Allergens",
      value: NOT_READABLE,
      tone: "unknown",
      icon: <Info className="h-4 w-4 text-muted-foreground" />,
    })
    cautions.push(
      "No allergen declaration was legible, so a missing list here does NOT mean the product is allergen-free. Check the physical pack."
    )
  } else if (allergens.length === 0) {
    metrics.push({
      label: "Allergens",
      value: "None declared on label",
      tone: "good",
      icon: <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />,
    })
    reasons.push("The printed allergen declaration did not list any allergen.")
  } else {
    metrics.push({
      label: "Allergens",
      value: `${allergens.length} declared: ${allergens.slice(0, 2).join(", ")}${
        allergens.length > 2 ? "…" : ""
      }`,
      tone: "caution",
      icon: <ShieldAlert className="h-4 w-4 text-rose-600 dark:text-rose-400" />,
    })
    cautions.push(`Declared allergens: ${allergens.join(", ")}.`)
  }

  // 2. Ingredient list / additives -------------------------------------------
  if (!ingredientsKnown) {
    metrics.push({
      label: "Ingredients",
      value: NOT_READABLE,
      tone: "unknown",
      icon: <Info className="h-4 w-4 text-muted-foreground" />,
    })
    cautions.push("The ingredient list could not be read, so nothing can be confirmed about additives.")
  } else if (additives.length > 0) {
    metrics.push({
      label: "Additives",
      value: `${additives.length} flagged in readable text`,
      tone: "warn",
      icon: <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
    })
    cautions.push(
      `Readable text lists ${additives.length} additive/preservative ingredient(s): ${additives
        .slice(0, 4)
        .map((i) => i.name)
        .join(", ")}.`
    )
  } else {
    metrics.push({
      label: "Additives",
      value: "None flagged in readable text",
      tone: "good",
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />,
    })
    reasons.push("The readable ingredient list did not contain a flagged additive.")
  }

  // 3. Sugar -----------------------------------------------------------------
  if (sugarsNum === null) {
    metrics.push({
      label: "Sugar",
      value: NOT_READABLE,
      tone: "unknown",
      icon: <Info className="h-4 w-4 text-muted-foreground" />,
    })
    cautions.push("No sugar value was readable, so sugar content cannot be commented on.")
  } else if (highSugars.length > 0 || sugarsNum > 15) {
    metrics.push({
      label: "Sugar",
      value: `${n?.sugars} as printed`,
      tone: "warn",
      icon: <Heart className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
    })
    cautions.push(`Printed sugar value is ${n?.sugars} per serving as shown on the panel.`)
  } else {
    metrics.push({
      label: "Sugar",
      value: `${n?.sugars} as printed`,
      tone: "good",
      icon: <Heart className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />,
    })
    reasons.push(`Printed sugar value is ${n?.sugars} per serving.`)
  }

  // 4. Sodium & printed warnings ---------------------------------------------
  if (!warningsKnown && sodiumNum === null) {
    metrics.push({
      label: "Warnings & sodium",
      value: NOT_READABLE,
      tone: "unknown",
      icon: <Info className="h-4 w-4 text-muted-foreground" />,
    })
    cautions.push("No warning statement or sodium value was readable on this photo.")
  } else if (warningsKnown) {
    metrics.push({
      label: "Warnings",
      value: `${warnings.length} printed statement(s)`,
      tone: "caution",
      icon: <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
    })
    cautions.push(...warnings)
  } else if (sodiumNum !== null && highSodium.length > 0) {
    metrics.push({
      label: "Sodium",
      value: `${n?.sodium} as printed`,
      tone: "warn",
      icon: <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
    })
    cautions.push(`Printed sodium value is ${n?.sodium}.`)
  } else {
    metrics.push({
      label: "Warnings & sodium",
      value: "No warning statement printed",
      tone: "good",
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />,
    })
    reasons.push("No warning statement was printed in the readable area of the label.")
  }

  // Not enough of the label was read to say anything useful.
  if (knownCount <= 1) {
    return {
      status: "unknown",
      title: "Not Enough Label Information",
      badgeText: "Cannot Be Determined",
      score: coverage,
      headline:
        "Too little of this label was legible to assess. Nothing has been estimated or filled in — re-scan with the whole label in frame and good lighting.",
      reasons,
      cautions,
      metrics,
    }
  }

  if (allergens.length > 0 || warningsKnown) {
    return {
      status: "caution",
      title: "Read Before Eating",
      badgeText: "Check The Label",
      score: coverage,
      headline:
        "The readable label carries an allergen declaration or a printed warning. This is a record of what the pack says, not a health judgement.",
      reasons,
      cautions,
      metrics,
    }
  }

  if (additives.length > 0 || highSugars.length > 0 || highSodium.length > 0) {
    return {
      status: "moderate",
      title: "Flagged Ingredients In The Readable Text",
      badgeText: "Review Ingredients",
      score: coverage,
      headline:
        "The readable ingredient or nutrition text shows additives, sugars or sodium worth reviewing. Judge with the rest of your diet — this is not a safety rating.",
      reasons,
      cautions,
      metrics,
    }
  }

  return {
    status: "clear",
    title: "Nothing Flagged In The Readable Text",
    badgeText: "No Flags Found",
    score: coverage,
    headline:
      "Nothing in the text this scan could read raised a flag. That covers only the printed text that was legible — it is not a guarantee about the product.",
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
        <p className="text-sm italic text-muted-foreground">{empty}</p>
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

  const missingNutrition = nutritionRows.filter(([, value]) => !value).length

  const verdictStyles = {
    clear: {
      border: "border-emerald-500/40 bg-emerald-500/5",
      badge: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30",
      score: "text-emerald-700 dark:text-emerald-400",
    },
    moderate: {
      border: "border-amber-500/40 bg-amber-500/5",
      badge: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30",
      score: "text-amber-700 dark:text-amber-400",
    },
    caution: {
      border: "border-rose-500/40 bg-rose-500/5",
      badge: "bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30",
      score: "text-rose-700 dark:text-rose-400",
    },
    unknown: {
      border: "border-border bg-muted/20",
      badge: "bg-muted text-muted-foreground border-border",
      score: "text-muted-foreground",
    },
  }[verdict.status]

  return (
    <div className="space-y-6">
      {/* 1. Label assessment card — only what was readable */}
      <Card className={`relative overflow-hidden border-2 ${verdictStyles.border} shadow-sm transition-all`}>
        <div className="space-y-5 p-6">
          <div className="flex flex-col justify-between gap-3 border-b border-border/60 pb-4 sm:flex-row sm:items-center">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-bold ${verdictStyles.badge}`}
                >
                  {verdict.badgeText}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Label Assessment
                </span>
              </div>
              <h3 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
                {verdict.title}
              </h3>
            </div>

            <div className="flex shrink-0 items-center gap-3 rounded-xl border bg-card p-2.5 shadow-2xs">
              <div className="text-right">
                <div className="text-[10px] font-semibold uppercase text-muted-foreground">
                  Label coverage
                </div>
                <div className={`text-2xl font-black tabular-nums ${verdictStyles.score}`}>
                  {verdict.score}
                  <span className="text-xs font-normal text-muted-foreground">%</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm font-medium leading-relaxed text-foreground">{verdict.headline}</p>

          {/* Diagnostic grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {verdict.metrics.map((m, idx) => (
              <div key={idx} className="space-y-1 rounded-xl border bg-card/80 p-3 shadow-2xs">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-semibold text-muted-foreground">{m.label}</span>
                  {m.icon}
                </div>
                <div
                  className={`text-xs font-bold ${
                    m.tone === "unknown" ? "italic text-muted-foreground" : "text-foreground"
                  }`}
                >
                  {m.value}
                </div>
              </div>
            ))}
          </div>

          {/* Statements & cautions */}
          <div className="grid gap-3 pt-1 text-xs sm:grid-cols-2">
            {verdict.reasons.length > 0 && (
              <div className="space-y-1.5 rounded-xl border bg-card p-3">
                <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Stated on the readable label
                </div>
                <ul className="space-y-1 text-muted-foreground">
                  {verdict.reasons.map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="font-bold text-emerald-500">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {verdict.cautions.length > 0 && (
              <div className="space-y-1.5 rounded-xl border bg-card p-3">
                <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="h-3.5 w-3.5" /> What to check yourself
                </div>
                <ul className="space-y-1 text-muted-foreground">
                  {verdict.cautions.map((c, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="font-bold text-amber-500">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <p className="rounded-lg bg-muted/50 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
            This card summarises the text that was actually readable in your photo. It is not a
            health, safety or purity rating, and it never fills in values that the scan could not
            read.
          </p>
        </div>
      </Card>

      {/* 2. Product identity & summary */}
      <Card className="border bg-card shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
              {report.productName ?? "Product name not readable"}
            </CardTitle>
            <Badge variant="secondary" className="text-xs font-semibold capitalize">
              {report.category ?? "Category not stated"}
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
            Summary is synthesized strictly from readable label text. It does not constitute a
            medical diagnosis.
          </div>
        </CardContent>
      </Card>

      {/* 3. Label Truth Mode */}
      <Card className="border bg-card shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <Eye className="h-5 w-5 shrink-0 text-primary" />
              <span>Label Truth Mode</span>
            </CardTitle>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Verification Engine
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Verbatim printed text, AI explanations, and unverified data are segregated with zero
            bleed.
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={(v) => setMode(v as TruthMode)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="on-label" className="text-xs font-semibold sm:text-sm">
                On Label (Verbatim)
              </TabsTrigger>
              <TabsTrigger value="ai-explanation" className="text-xs font-semibold sm:text-sm">
                AI Explanation
              </TabsTrigger>
              <TabsTrigger value="not-verified" className="text-xs font-semibold sm:text-sm">
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
                empty="No warning statement was printed or legible."
                tone="warning"
              />
              <Section
                title="Storage Instructions"
                items={report.onLabel.storageInstructions}
                empty="Not printed on packaging, or not readable."
              />
              <Section
                title="Usage Instructions"
                items={report.onLabel.usageInstructions}
                empty="Not printed on packaging, or not readable."
              />

              <div className="grid grid-cols-2 gap-3 border-t pt-4 text-xs sm:grid-cols-4">
                <div className="rounded-md border bg-muted/20 p-2">
                  <div className="text-muted-foreground">Ingredients Listed</div>
                  <div className="font-semibold text-foreground">
                    {report.onLabel.ingredientsListed ? "Yes" : "Not found"}
                  </div>
                </div>
                <div className="rounded-md border bg-muted/20 p-2">
                  <div className="text-muted-foreground">Allergens Listed</div>
                  <div className="font-semibold text-foreground">
                    {report.onLabel.allergensListed ? "Yes" : "Not found"}
                  </div>
                </div>
                <div className="rounded-md border bg-muted/20 p-2">
                  <div className="text-muted-foreground">Nutrition Panel</div>
                  <div className="font-semibold text-foreground">
                    {report.onLabel.nutritionVisible ? "Visible" : "Not visible"}
                  </div>
                </div>
                <div className="rounded-md border bg-muted/20 p-2">
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
                Scientific context generated by the multimodal model. These explanations are not
                printed on the package.
              </div>

              {report.ingredients.length === 0 ? (
                <p className="text-sm italic text-muted-foreground">
                  No legible ingredients were found to explain.
                </p>
              ) : (
                <div className="space-y-3">
                  {report.ingredients.map((ing, i) => (
                    <div key={i} className="space-y-1.5 rounded-xl border bg-muted/10 p-3.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-foreground">{ing.name}</span>
                        <Badge variant="outline" className="text-[10px] font-semibold tabular-nums">
                          {ing.confidence} confidence
                        </Badge>
                        {ing.flag !== "none" && (
                          <Badge variant="destructive" className="text-[10px] font-bold uppercase">
                            {ing.flag}
                          </Badge>
                        )}
                      </div>
                      {ing.sourceText && (
                        <p className="text-xs text-muted-foreground">
                          <span className="font-semibold">Printed:</span> {ing.sourceText}
                        </p>
                      )}
                      <p className="text-sm leading-relaxed text-foreground">{ing.explanation}</p>
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
                Information that could not be authoritatively verified from the photograph
                provided. Nothing here is guessed.
              </div>
              <Section
                title="Unreadable Information"
                items={report.unreadableInformation}
                empty="Nothing was flagged as unreadable."
              />
              <Section
                title="Not Present On This Label"
                items={report.missingInformation}
                empty="No standard disclosures were reported missing."
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 4. Nutrition facts table */}
      <Card className="border bg-card shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold">Nutrition Facts</CardTitle>
          <p className="text-xs text-muted-foreground">
            Values exactly as printed on the nutrition panel. Nothing is estimated or filled in.
          </p>
        </CardHeader>
        <CardContent>
          {!n ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <X className="h-4 w-4 text-muted-foreground" /> No nutrition panel was readable on
              this label, so no values are shown.
            </p>
          ) : (
            <div className="space-y-2">
              <div className="overflow-hidden rounded-lg border">
                <dl className="divide-y text-sm">
                  {nutritionRows.map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between px-4 py-2 transition-colors hover:bg-muted/30"
                    >
                      <dt className="font-medium text-muted-foreground">{label}</dt>
                      <dd
                        className={`font-bold tabular-nums ${
                          value ? "text-foreground" : "italic text-muted-foreground/70"
                        }`}
                      >
                        {value ?? "not readable"}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
              {missingNutrition > 0 && (
                <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                  <Info className="mt-0.5 h-3 w-3 shrink-0" />
                  {missingNutrition} row{missingNutrition > 1 ? "s" : ""} could not be read from the
                  photo. Those values are left blank on purpose — they were not estimated.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 5. Allergens & warnings */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border bg-card shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Declared Allergens</CardTitle>
          </CardHeader>
          <CardContent>
            {report.allergens.length === 0 ? (
              report.onLabel.allergensListed ? (
                <p className="text-sm italic text-muted-foreground">
                  No allergen was listed in the printed declaration.
                </p>
              ) : (
                <p className="flex items-start gap-1.5 text-sm italic text-muted-foreground">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  No allergen declaration could be read. Absence here does not mean this product is
                  allergen-free.
                </p>
              )
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {report.allergens.map((a, i) => (
                  <Badge key={i} variant="secondary" className="text-xs font-semibold">
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
              <p className="text-sm italic text-muted-foreground">
                No warning statement was printed in the readable area of the label.
              </p>
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
