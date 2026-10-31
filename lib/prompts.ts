import type { ProductReport } from "./types"

/**
 * Prompt for the initial image analysis.
 *
 * The accuracy rules are non-negotiable: the model may only report what it
 * can actually read, must use null when information is absent, and must
 * surface unreadable/missing sections instead of guessing.
 */
export function buildAnalysisPrompt(): string {
  return `You are LabelLens, a product-label reading assistant. Read the attached photograph of a product label and return a single JSON object. Output JSON only — no markdown, no code fences, no commentary.

Return exactly this shape:
{
  "productName": string|null,
  "brand": string|null,
  "category": string|null,
  "summary": string,
  "confidence": "high"|"medium"|"low",
  "onLabel": {
    "ingredientsText": string[],
    "allergenDeclarations": string[],
    "warnings": string[],
    "storageInstructions": string[],
    "usageInstructions": string[],
    "ingredientsListed": boolean,
    "allergensListed": boolean,
    "nutritionVisible": boolean,
    "expiryDate": string|null
  },
  "ingredients": [
    { "name": string, "sourceText": string, "purpose": string, "explanation": string, "confidence": "high"|"medium"|"low", "flag": "none"|"allergen"|"high-sugar"|"high-sodium"|"high-fat"|"additive" }
  ],
  "allergens": string[],
  "warnings": string[],
  "storageInstructions": string[],
  "usageInstructions": string[],
  "unreadableInformation": string[],
  "missingInformation": string[],
  "nutrition": { "servingSize": string|null, "servingsPerContainer": string|null, "calories": string|null, "protein": string|null, "carbohydrates": string|null, "sugars": string|null, "fat": string|null, "saturatedFat": string|null, "sodium": string|null, "fiber": string|null }|null
}

Rules — follow them exactly:
- "onLabel" holds text that is literally printed on the package. Copy it verbatim.
- "ingredients[].sourceText" must be the printed text for that ingredient. "purpose" and "explanation" are your own plain-language description, not label text.
- Never invent an ingredient, nutrition value, allergen declaration, or warning.
- Use null for any value you cannot read. Do not guess numbers.
- List blurry, cropped or illegible areas in "unreadableInformation".
- List sections that simply are not present on this label in "missingInformation".
- Do not state that the product is safe or unsafe. Do not give medical advice.
- Keep "summary" to 2-4 plain-language sentences.`
}

export const NOT_AVAILABLE_EN = "This information is not available in the scanned label."
export const NOT_AVAILABLE_HI = "यह जानकारी स्कैन किए गए लेबल में उपलब्ध नहीं है।"

export type AskLanguage = "en" | "hi"

export interface AskContext {
  language?: AskLanguage
  /** Earlier turns of this same conversation, oldest first. */
  history?: { question: string; answer: string }[]
}

/**
 * Grounded question answering over an already-saved report.
 * The report is the only permitted source of truth; earlier turns only supply
 * conversational context, never new facts.
 */
export function buildAskPrompt(
  question: string,
  report: ProductReport,
  context: AskContext = {}
): string {
  const language = context.language ?? "en"
  const history = context.history ?? []

  const transcript = history.length
    ? history.map((turn, i) => `Q${i + 1}: ${turn.question}\nA${i + 1}: ${turn.answer}`).join("\n")
    : "(this is the first question about this label)"

  const languageRule =
    language === "hi"
      ? `LANGUAGE: Write the whole answer in natural Hindi using Devanagari script. Keep printed label text (ingredient names, numbers, units) in its original form. If the answer is not in the report, reply exactly:
"${NOT_AVAILABLE_HI}"`
      : `LANGUAGE: Write the whole answer in plain English. If the answer is not in the report, reply exactly:
"${NOT_AVAILABLE_EN}"`

  return `You are LabelLens, answering a follow-up question about one specific product label that was already scanned.

Rules:
- Use ONLY the saved report below as the source of facts.
- Earlier turns are context for what the user already asked. They may contain answers you gave; they may NOT be used to introduce facts that are absent from the report.
- Never invent an ingredient, nutrition value, allergen, warning or instruction.
- Do not give medical advice and do not call the product safe, unsafe, healthy or unhealthy.
- Answer in 1-3 short sentences of plain language. No markdown, no bullet points, no preamble.
- ${languageRule}

EARLIER TURNS:
${transcript}

SAVED REPORT:
${JSON.stringify(report)}

QUESTION: ${question}`
}
