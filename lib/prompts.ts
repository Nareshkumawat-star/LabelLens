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

/**
 * Grounded question answering over an already-saved report.
 * The report is the only permitted source of truth.
 */
export function buildAskPrompt(question: string, report: ProductReport): string {
  return `You are LabelLens answering a question about one specific scanned product label.

Use ONLY the saved report below. If the answer is not present in it, reply exactly:
"This information is not available in the scanned label."

Never invent product data. Do not give medical advice. Do not say a product is safe or unsafe. Answer in 1-3 short sentences of plain language.

SAVED REPORT:
${JSON.stringify(report)}

QUESTION: ${question}`
}
