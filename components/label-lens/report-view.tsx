"use client"

import * as React from "react"
import { Eye, Sparkles, AlertTriangle, HelpCircle, Check, X, ShieldAlert } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ProductReport, TruthMode } from "@/lib/types"

interface Props {
  report: ProductReport
}

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
    <div className="space-y-2">
      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</h4>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">{empty}</p>
      ) : (
        <ul className="space-y-1.5 text-sm">
          {items.map((item, i) => (
            <li
              key={i}
              className={
                tone === "warning"
                  ? "flex items-start gap-2 rounded-md bg-amber-500/10 p-2 text-amber-900 dark:text-amber-200"
                  : "flex items-start gap-2"
              }
            >
              {tone === "warning" && (
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
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

  return (
    <div className="space-y-6">
      {/* Product Identity & AI Summary */}
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
          {report.brand && (
            <p className="text-sm font-medium text-muted-foreground">{report.brand}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm leading-relaxed text-foreground">{report.summary}</p>
          <div className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            Summary is synthesized strictly from readable label text. It does not constitute a health score or medical verdict.
          </div>
        </CardContent>
      </Card>

      {/* Label Truth Mode */}
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
                          <Badge
                            variant="destructive"
                            className="text-[10px] uppercase font-bold"
                          >
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

      {/* Nutrition Facts Table */}
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

      {/* Allergens & Warnings Cards */}
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
