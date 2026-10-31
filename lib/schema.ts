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

  return { ok: true, report: result.data }
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
