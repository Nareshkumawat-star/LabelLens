"use client"

import * as React from "react"
import { Eye, Sparkles, AlertTriangle, HelpCircle, Check, X } from "lucide-react"

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
    <div className="space-y-1.5">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h4>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {items.map((item, i) => (
            <li key={i} className={tone === "warning" ? "flex gap-2" : ""}>
              {tone === "warning" && <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />}
              <span>{item}</span>
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
        ["Energy", n.calories],
        ["Protein", n.protein],
        ["Carbohydrates", n.carbohydrates],
        ["Sugars", n.sugars],
        ["Fat", n.fat],
        ["Saturated fat", n.saturatedFat],
        ["Sodium", n.sodium],
        ["Fibre", n.fiber],
      ]
    : []

  return (
    <div className="space-y-6">
      {/* Identity + summary */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-2xl">{report.productName ?? "Unnamed product"}</CardTitle>
            <Badge variant="secondary">{report.category ?? "uncategorised"}</Badge>
            <Badge variant="outline">confidence: {report.confidence}</Badge>
          </div>
          {report.brand && <p className="text-sm text-muted-foreground">{report.brand}</p>}
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm leading-relaxed">{report.summary}</p>
          <p className="text-xs text-muted-foreground">
            Summary is AI-written from the label text. It is not a health verdict.
          </p>
        </CardContent>
      </Card>

      {/* Label Truth Mode */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Eye className="h-5 w-5 text-primary" /> Label Truth Mode
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Printed text, AI explanation and unverified information are kept strictly apart.
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={(v) => setMode(v as TruthMode)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="on-label">On Label</TabsTrigger>
              <TabsTrigger value="ai-explanation">AI Explanation</TabsTrigger>
              <TabsTrigger value="not-verified">Not Verified</TabsTrigger>
            </TabsList>

            <TabsContent value="on-label" className="space-y-4 pt-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                Text printed on the packaging, copied as-is.
              </div>
              <Section
                title="Ingredient list"
                items={report.onLabel.ingredientsText}
                empty="No ingredient block was readable on this label."
              />
              <Section
                title="Declared allergens"
                items={report.onLabel.allergenDeclarations}
                empty="No allergen declaration was printed (or readable)."
              />
              <Section
                title="Printed warnings"
                items={report.onLabel.warnings}
                empty="No warning statement was printed (or readable)."
                tone="warning"
              />
              <Section
                title="Storage instructions"
                items={report.onLabel.storageInstructions}
                empty="Not printed."
              />
              <Section
                title="Usage instructions"
                items={report.onLabel.usageInstructions}
                empty="Not printed."
              />
              <div className="grid grid-cols-2 gap-3 border-t pt-3 text-xs">
                <span>Ingredients listed: {report.onLabel.ingredientsListed ? "yes" : "no"}</span>
                <span>Allergens listed: {report.onLabel.allergensListed ? "yes" : "no"}</span>
                <span>Nutrition panel visible: {report.onLabel.nutritionVisible ? "yes" : "no"}</span>
                <span>Expiry: {report.onLabel.expiryDate ?? "not found"}</span>
              </div>
            </TabsContent>

            <TabsContent value="ai-explanation" className="space-y-3 pt-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Written by the model. Not printed on the package.
              </div>
              {report.ingredients.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  There were no readable ingredients to explain.
                </p>
              ) : (
                report.ingredients.map((ing, i) => (
                  <div key={i} className="rounded-lg border p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{ing.name}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {ing.confidence} confidence
                      </Badge>
                      {ing.flag !== "none" && (
                        <Badge variant="secondary" className="text-[10px]">
                          {ing.flag}
                        </Badge>
                      )}
                    </div>
                    {ing.sourceText && (
                      <p className="mt-1 text-xs text-muted-foreground">Printed: {ing.sourceText}</p>
                    )}
                    <p className="mt-1.5 text-sm">{ing.explanation}</p>
                    {ing.purpose && (
                      <p className="text-xs text-muted-foreground">Typical role: {ing.purpose}</p>
                    )}
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="not-verified" className="space-y-4 pt-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <HelpCircle className="h-3.5 w-3.5 text-amber-600" />
                Could not be established from this photograph.
              </div>
              <Section
                title="Unreadable"
                items={report.unreadableInformation}
                empty="Nothing was flagged as unreadable."
              />
              <Section
                title="Missing from the label"
                items={report.missingInformation}
                empty="No sections were reported missing."
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Nutrition */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Nutrition facts</CardTitle>
        </CardHeader>
        <CardContent>
          {!n ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <X className="h-4 w-4" /> No nutrition panel was readable on this label.
            </p>
          ) : (
            <dl className="divide-y text-sm">
              {nutritionRows.map(([label, value]) => (
                <div key={label} className="flex justify-between py-1.5">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium">{value ?? "—"}</dd>
                </div>
              ))}
            </dl>
          )}
        </CardContent>
      </Card>

      {/* Allergens / warnings at a glance */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Declared allergens</CardTitle>
          </CardHeader>
          <CardContent>
            {report.allergens.length === 0 ? (
              <p className="text-sm text-muted-foreground">None declared on the readable label.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {report.allergens.map((a, i) => (
                  <Badge key={i} variant="secondary">
                    {a}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Printed warnings</CardTitle>
          </CardHeader>
          <CardContent>
            {report.warnings.length === 0 ? (
              <p className="text-sm text-muted-foreground">None printed on the readable label.</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {report.warnings.map((w, i) => (
                  <li key={i} className="flex gap-2">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                    <span>{w}</span>
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
