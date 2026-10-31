import { z } from "zod"

/**
 * Zod contract for the model's structured output.
 *
 * We validate before persisting: a malformed or hallucinated-shape response
 * must never reach MongoDB or the UI. Anything that fails here is a 502.
 */
const Confidence = z.enum(["high", "medium", "low"])

const Ingredient = z.object({
  name: z.string(),
  sourceText: z.string(),
  purpose: z.string(),
  explanation: z.string(),
  confidence: Confidence,
  flag: z.enum(["none", "allergen", "high-sugar", "high-sodium", "high-fat", "additive"]),
})

const Nutrition = z.object({
  servingSize: z.string().nullable(),
  servingsPerContainer: z.string().nullable(),
  calories: z.string().nullable(),
  protein: z.string().nullable(),
  carbohydrates: z.string().nullable(),
  sugars: z.string().nullable(),
  fat: z.string().nullable(),
  saturatedFat: z.string().nullable(),
  sodium: z.string().nullable(),
  fiber: z.string().nullable(),
})

export const ProductReportSchema = z.object({
  productName: z.string().nullable(),
  brand: z.string().nullable(),
  category: z.string().nullable(),
  summary: z.string(),
  confidence: Confidence,
  onLabel: z.object({
    ingredientsText: z.array(z.string()),
    allergenDeclarations: z.array(z.string()),
    warnings: z.array(z.string()),
    storageInstructions: z.array(z.string()),
    usageInstructions: z.array(z.string()),
    ingredientsListed: z.boolean(),
    allergensListed: z.boolean(),
    nutritionVisible: z.boolean(),
    expiryDate: z.string().nullable(),
  }),
  ingredients: z.array(Ingredient),
  allergens: z.array(z.string()),
  warnings: z.array(z.string()),
  storageInstructions: z.array(z.string()),
  usageInstructions: z.array(z.string()),
  unreadableInformation: z.array(z.string()),
  missingInformation: z.array(z.string()),
  nutrition: Nutrition.nullable(),
})

export type ParsedReport = z.infer<typeof ProductReportSchema>

export interface ParseFailure {
  ok: false
  error: string
  issues: string[]
}

export function parseAIOutput(raw: string): { ok: true; report: ParsedReport } | ParseFailure {
  let json: unknown
  try {
    json = JSON.parse(raw)
  } catch (err) {
    return {
      ok: false,
      error: "The model did not return valid JSON.",
      issues: [err instanceof Error ? err.message : String(err)],
    }
  }

  if (typeof json !== "object" || json === null || Array.isArray(json)) {
    return { ok: false, error: "The model did not return a JSON object.", issues: [] }
  }

  const result = ProductReportSchema.safeParse(json)
  if (!result.success) {
    return {
      ok: false,
      error: "The model response failed schema validation.",
      issues: result.error.issues.map((i) => `${i.path.join(".") || "root"}: ${i.message}`),
    }
  }

  return { ok: true, report: normalizeReport(result.data) }
}

/**
 * Text a model writes when it is guessing or reporting absence. These are not
 * data points, so they are stripped to `null` instead of being shown as values.
 */
const NO_VALUE = /^(n\/?a|na|nil|none|null|unknown|unclear|not\s+(visible|readable|available|listed|stated|specified|provided)|not\s+applicable|no\s+data|—|-|\.+)$/i

function cleanText(value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null
  const trimmed = value.trim()
  if (!trimmed || NO_VALUE.test(trimmed)) return null
  return trimmed
}

function cleanList(values: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of values) {
    const cleaned = cleanText(raw)
    if (!cleaned) continue
    const key = cleaned.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(cleaned)
  }
  return out
}

/**
 * Drop placeholder tokens, empty ingredients and an all-empty nutrition panel.
 * Normalising absence into `null` keeps the UI honest: it can then say "not
 * readable" instead of rendering "N/A" as if it were a measurement.
 */
function normalizeReport(report: ParsedReport): ParsedReport {
  const nutrition = report.nutrition
    ? {
        servingSize: cleanText(report.nutrition.servingSize),
        servingsPerContainer: cleanText(report.nutrition.servingsPerContainer),
        calories: cleanText(report.nutrition.calories),
        protein: cleanText(report.nutrition.protein),
        carbohydrates: cleanText(report.nutrition.carbohydrates),
        sugars: cleanText(report.nutrition.sugars),
        fat: cleanText(report.nutrition.fat),
        saturatedFat: cleanText(report.nutrition.saturatedFat),
        sodium: cleanText(report.nutrition.sodium),
        fiber: cleanText(report.nutrition.fiber),
      }
    : null

  const nutritionHasValues = nutrition
    ? Object.values(nutrition).some((v) => v !== null)
    : false

  const ingredients = report.ingredients
    .map((ing) => ({
      ...ing,
      name: cleanText(ing.name) ?? "",
      sourceText: cleanText(ing.sourceText) ?? "",
      purpose: cleanText(ing.purpose) ?? "",
      explanation: cleanText(ing.explanation) ?? "",
    }))
    .filter((ing) => ing.name.length > 0)

  const onLabel = {
    ...report.onLabel,
    ingredientsText: cleanList(report.onLabel.ingredientsText),
    allergenDeclarations: cleanList(report.onLabel.allergenDeclarations),
    warnings: cleanList(report.onLabel.warnings),
    storageInstructions: cleanList(report.onLabel.storageInstructions),
    usageInstructions: cleanList(report.onLabel.usageInstructions),
    expiryDate: cleanText(report.onLabel.expiryDate),
    // Nothing printable was found: reflect that instead of claiming a panel.
    nutritionVisible: nutritionHasValues ? report.onLabel.nutritionVisible : false,
  }

  return {
    ...report,
    productName: cleanText(report.productName),
    brand: cleanText(report.brand),
    category: cleanText(report.category),
    ingredients,
    allergens: cleanList(report.allergens),
    warnings: cleanList(report.warnings),
    storageInstructions: cleanList(report.storageInstructions),
    usageInstructions: cleanList(report.usageInstructions),
    unreadableInformation: cleanList(report.unreadableInformation),
    missingInformation: cleanList(report.missingInformation),
    onLabel,
    nutrition: nutritionHasValues ? nutrition : null,
  }
}

/** One earlier turn of the same conversation, used as grounding context. */
const AskTurnSchema = z.object({
  question: z.string().max(500),
  answer: z.string().max(4000),
})

/** Request body validation for the Ask Your Label endpoint. */
export const AskRequestSchema = z.object({
  scanId: z.string().min(1, "scanId is required"),
  question: z.string().min(2, "question is too short").max(500),
  /** Language the answer should be written in. */
  language: z.enum(["en", "hi"]).optional().default("en"),
  /** Recent turns, oldest first. Capped so the prompt stays small. */
  history: z.array(AskTurnSchema).max(6).optional(),
})
