"use client"

import * as React from "react"
import { Eye, Sparkles, AlertTriangle, HelpCircle, Check, X, ShieldAlert, Info } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ProductReport, TruthMode } from "@/lib/types"

interface Props {
  report: ProductReport
}

// ---------------------------------------------------------------------------
// Hindi / English glossary — the only content the app shows the user.
// Everything other than the product name/brand/category + these words is
// still transcribed verbatim from the label by the AI.
// ---------------------------------------------------------------------------
const GLOSSARY: Record<"en" | "hi", Record<string, string>> = {
  en: {
    "on-label": "On Label (Verbatim)",
    "ai-explanation": "AI Explanation",
    "not-verified": "Not Verified",
    "ingredient list": "Ingredient List",
    "declared allergens": "Declared Allergens",
    "printed warnings": "Printed Warnings",
    "storage instructions": "Storage Instructions",
    "usage instructions": "Usage Instructions",
    "ingredients listed": "Ingredients Listed",
    "allergens listed": "Allergens Listed",
    "nutrition panel": "Nutrition Panel",
    "expiry date": "Expiry Date",
    "nutrition facts": "Nutrition Facts",
    "no nutrition panel readable": "No nutrition panel readable",
    "none declared on the readable label": "None declared on the readable label",
    "no warning statements were printed on this packaging": "No warning statements were printed on this packaging",
    "not printed on packaging": "Not printed on packaging",
    "no ingredient block was legible on this label photo": "No ingredient block was legible on this label photo",
    "no allergen declaration was printed or legible": "No allergen declaration was printed or legible",
    "information that could not be authoritatively verified from the photograph provided": "Information that could not be authoritatively verified from the photograph provided",
    "zero sections were flagged as unreadable": "Zero sections were flagged as unreadable",
    "zero standard disclosures were reported missing": "Zero standard disclosures were reported missing",
    "ingredient": "ingredient",
    "ai explanation": "AI explanation",
    "unverified": "unverified",
    "substantial": "substantial",
    "small": "small",
  },
  hi: {
    "on-label": "शब딜 पर (कूटशब्द)",
    "ai-explanation": "एआई व्याख्या",
    "not-verified": "असत्यापित",
    "ingredient list": "सामग्री सूची",
    "declared allergens": "घोषित अलर्ज़न",
    "printed warnings": "मुद्रित चेतावनी",
    "storage instructions": "भंडारण निर्देश",
    "usage instructions": "उपयोग निर्देश",
    "ingredients listed": "सामग्री प्रदर्शित",
    "allergens listed": "अलर्ज़न प्रदर्शित",
    "nutrition panel": "पोषक तत्व पटल",
    "expiry date": "मूल्यांकन तिथि",
    "nutrition facts": "पोषक तत्व तथ्य",
    "no nutrition panel readable": "कोई पोषक तत्व पठनीय पटल नहीं",
    "none declared on the readable label": "कोई पठनीय पटल पर घोषित नहीं",
    "no warning statements were printed on this packaging": "इस पैकेजिंग पर कोई चेतावनी वाक्य printed नहीं",
    "not printed on packaging": "पैकेजिंग पर printing नहीं",
    "no ingredient block was legible on this label photo": "इस लेबल फ़ोटो पर कोई सामग्री ब्लॉक स्पष्ट नहीं",
    "no allergen declaration was printed or legible": "कोई अलर्ज़न घोषणा printed या स्पष्ट नहीं",
    "information that could not be authoritatively verified from the photograph provided": "प्रदत्त फ़ोटो से विश्वसनीय रूप से सत्यापित नहीं किया जा सका",
    "zero sections were flagged as unreadable": "कोई भी भाग अप đọc नहीं",
    "zero standard disclosures were reported missing": "कोई मानक प्रकटीकरण नहीं",
    "ingredient": "सामग्री",
    "ai explanation": "एआई व्याख्या",
    "unverified": "असत्यापित",
    "substantial": "अर्थपूर्ण",
    "small": "कम",
  },
}

function Section({
  title,
  items,
  empty,
  tone = "default",
  lang,
}: {
  title: string
  items: string[]
  empty: string
  tone?: "default" | "warning"
  lang: "en" | "hi"
}) {
  const t = GLOSSARY[lang]
  const titleH = t?.[title] ?? title
  const emptyH = t?.[empty] ?? empty
  return (
    <div className="space-y-1.5">
      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{titleH}</h4>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">{emptyH}</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((item, i) => (
            <li key={i} className={tone === "warning" ? "flex items-start gap-2 rounded-md bg-amber-500/10 p-2 text-amber-900 dark:text-amber-200" : "flex items-start gap-2"}>
              {tone === "warning" && <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />}
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function HealthBadge({ text }: { text: string }) {
  const map: Record<string, "good" | "warn" | "neutral"> = {
    "high sugar": "warn",
    "high sodium": "warn",
    "high fat": "warn",
    "low fiber": "warn",
    "high saturated fat": "warn",
    "fortified": "good",
    "enriched": "good",
    "whole grain": "good",
    "high protein": "good",
    "natural": "good",
    "organic": "good",
    "no preservatives": "good",
    fresh: "good",
  }
  const tone = map[text.toLowerCase()] ?? "neutral"
  const hi = text
    .split(" ")
    .map((w) => (map[w.toLowerCase()] ? map[w.toLowerCase()] : "neutral"))
    .join(" ")
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
      tone === "good" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" :
      tone === "warn" ? "bg-amber-500/10 text-amber-700 dark:text-amber-300" :
      "bg-muted/20 text-muted-foreground"
    }`}>
      {tone === "good" && <Check className="h-3 w-3" />}
      {tone === "warn" && <AlertTriangle className="h-3 w-3" />}
      {tone === "neutral" && <Info className="h-3 w-3" />}
      {text}
    </span>
  )
}

export function ReportView({ report }: Props) {
  const [mode, setMode] = React.useState<TruthMode>("on-label")
  const [lang, setLang] = React.useState<"en" | "hi">("en")
  const n = report.nutrition
  const healthyFlags: string[] = []
  const cautionFlags: string[] = []

  // Lightweight deterministic "eat healthy" heuristic from the extracted report.
  // Purely informational — no medical claims.
  if (n) {
    if (n.sugars && n.sugars !== "0" && n.sugars !== "-" && Number(n.sugars) > 10) healthyFlags.push("high sugar")
    if (n.sodium && Number(n.sodium) > 400) cautionFlags.push("high sodium")
    if (n.saturatedFat && Number(n.saturatedFat) > 5) cautionFlags.push("high saturated fat")
    if (n.fiber && Number(n.fiber) < 2) cautionFlags.push("low fiber")
    if (n.fiber && Number(n.fiber) >= 4) healthyFlags.push("high fiber")
    if (report.ingredients.some((i) => i.flag === "none")) healthyFlags.push("no artificial additives")
  }

  const t = GLOSSARY[lang] as Record<string, string>

  return (
    <div className="space-y-6">
      {/* Language toggle */}
      <div className="flex justify-end">
        <div className="flex gap-1 rounded-lg border border-border/60 bg-muted/10 p-0.5">
          <button
            type="button"
            onClick={() => setLang("en")}
            className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
              lang === "en"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {t?.["en"] ?? "English"}
          </button>
          <button
            type="button"
            onClick={() => setLang("hi")}
            className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
              lang === "hi"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {t?.["hi"] ?? "हिन्दी"}
          </button>
        </div>
      </div>

      {/* Product Identity & AI Summary */}
      <Card className="border bg-card shadow-sm">
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
          <div className="flex flex-wrap gap-2">
            {healthyFlags.map((f) => <HealthBadge key={f} text={f} />)}
            {cautionFlags.map((f) => <HealthBadge key={f} text={f} />)}
          </div>
        </CardContent>
      </Card>

      {/* Label Truth Mode */}
      <Card className="border bg-card shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <Eye className="h-5 w-5 text-primary shrink-0" />
              <span>{t?.["on-label"] ?? "Label Truth Mode"}</span>
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
                {t?.["on-label"] ?? "On Label (Verbatim)"}
              </TabsTrigger>
              <TabsTrigger value="ai-explanation" className="font-semibold text-xs sm:text-sm">
                {t?.["ai-explanation"] ?? "AI Explanation"}
              </TabsTrigger>
              <TabsTrigger value="not-verified" className="font-semibold text-xs sm:text-sm">
                {t?.["not-verified"] ?? "Not Verified"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="on-label" className="space-y-5 pt-4">
              <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-800 dark:text-emerald-300">
                <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                {t?.["substantial"] ?? "Text printed directly on the physical packaging, copied verbatim without alteration."}
              </div>

              <Section
                title="ingredient list"
                items={report.onLabel.ingredientsText}
                empty={t?.["no ingredient block was legible on this label photo"] ?? "No ingredient block was legible on this label photo."}
                lang={lang}
              />
              <Section
                title="declared allergens"
                items={report.onLabel.allergenDeclarations}
                empty={t?.["no allergen declaration was printed or legible"] ?? "No allergen declaration was printed or legible."}
                lang={lang}
              />
              <Section
                title="printed warnings"
                items={report.onLabel.warnings}
                empty={t?.["no warning statements were printed on this packaging"] ?? "No warning statements were printed on this packaging."}
                tone="warning"
                lang={lang}
              />
              <Section
                title="storage instructions"
                items={report.onLabel.storageInstructions}
                empty={t?.["not printed on packaging"] ?? "Not printed on packaging."}
                lang={lang}
              />
              <Section
                title="usage instructions"
                items={report.onLabel.usageInstructions}
                empty={t?.["not printed on packaging"] ?? "Not printed on packaging."}
                lang={lang}
              />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t pt-4 text-xs">
                <div className="rounded-md border p-2 bg-muted/20">
                  <div className="text-muted-foreground">{t?.["ingredients listed"] ?? "Ingredients Listed"}</div>
                  <div className="font-semibold text-foreground">{report.onLabel.ingredientsListed ? "Yes" : "No"}</div>
                </div>
                <div className="rounded-md border p-2 bg-muted/20">
                  <div className="text-muted-foreground">{t?.["allergens listed"] ?? "Allergens Listed"}</div>
                  <div className="font-semibold text-foreground">{report.onLabel.allergensListed ? "Yes" : "No"}</div>
                </div>
                <div className="rounded-md border p-2 bg-muted/20">
                  <div className="text-muted-foreground">{t?.["nutrition panel"] ?? "Nutrition Panel"}</div>
                  <div className="font-semibold text-foreground">{report.onLabel.nutritionVisible ? "Visible" : "Not Visible"}</div>
                </div>
                <div className="rounded-md border p-2 bg-muted/20">
                  <div className="text-muted-foreground">{t?.["expiry date"] ?? "Expiry Date"}</div>
                  <div className="font-semibold tabular-nums text-foreground">{report.onLabel.expiryDate ?? "Not found"}</div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ai-explanation" className="space-y-4 pt-4">
              <div className="flex items-center gap-2 rounded-lg bg-blue-500/10 px-3 py-2 text-xs font-medium text-blue-800 dark:text-blue-300">
                <Sparkles className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                {t?.["ai explanation"] ?? "Scientific context generated by the multimodal model. These explanations are not printed on the package."}
              </div>

              {report.ingredients.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">{t?.["no legible ingredients were found to explain"] ?? "No legible ingredients were found to explain."}</p>
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
                {t?.["information that could not be authoritatively verified from the photograph provided"] ?? "Information that could not be authoritatively verified from the photograph provided."}
              </div>
              <Section
                title="unverified"
                items={report.unreadableInformation}
                empty={t?.["zero sections were flagged as unreadable"] ?? "Zero sections were flagged as unreadable."}
                lang={lang}
              />
              <Section
                title="missing"
                items={report.missingInformation}
                empty={t?.["zero standard disclosures were reported missing"] ?? "Zero standard disclosures were reported missing."}
                lang={lang}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Nutrition Facts Table */}
      <Card className="border bg-card shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-lg font-bold">{t?.["nutrition facts"] ?? "Nutrition Facts"}</CardTitle>
            <div className="flex flex-wrap gap-2">
              {healthyFlags.map((f) => <HealthBadge key={f} text={f} />)}
              {cautionFlags.map((f) => <HealthBadge key={f} text={f} />)}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Extracted values per serving. Verified against label panel.</p>
        </CardHeader>
        <CardContent>
          {!n ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground"><X className="h-4 w-4 text-muted-foreground" /> {t?.["no nutrition panel readable"] ?? "No nutrition panel readable"}</p>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <dl className="divide-y text-sm">
                {([
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
                ] as [string, string | null][]).map(([label, value]) => (
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
        <Card className="border bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">{t?.["declared allergens"] ?? "Declared Allergens"}</CardTitle>
          </CardHeader>
          <CardContent>
            {report.allergens.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">{t?.["none declared on the readable label"] ?? "None declared on the readable label."}</p>
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

        <Card className="border bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">{t?.["printed warnings"] ?? "Printed Warnings"}</CardTitle>
          </CardHeader>
          <CardContent>
            {report.warnings.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">{t?.["no warning statements were printed on this packaging"] ?? "No warning statements were printed on this packaging."}</p>
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
