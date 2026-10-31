export type Confidence = "high" | "medium" | "low"

export type TruthMode = "on-label" | "ai-explanation" | "not-verified"

export interface NutrientItem {
  name: string
  amount: string | null
  dailyValue?: number
  unit?: string
}

export interface AnalyzedIngredient {
  name: string
  sourceText: string
  purpose: string
  explanation: string
  confidence: Confidence
  flag: "none" | "allergen" | "high-sugar" | "high-sodium" | "high-fat" | "additive"
}

export interface NutritionFacts {
  servingSize: string | null
  servingsPerContainer: string | null
  calories: string | null
  protein: string | null
  carbohydrates: string | null
  sugars: string | null
  fat: string | null
  saturatedFat: string | null
  sodium: string | null
  fiber: string | null
}

/** What Gemma reports, validated by Zod before it is ever persisted. */
export interface ProductReport {
  productName: string | null
  brand: string | null
  category: string | null
  summary: string
  confidence: Confidence
  onLabel: {
    ingredientsText: string[]
    allergenDeclarations: string[]
    warnings: string[]
    storageInstructions: string[]
    usageInstructions: string[]
    ingredientsListed: boolean
    allergensListed: boolean
    nutritionVisible: boolean
    expiryDate: string | null
  }
  ingredients: AnalyzedIngredient[]
  allergens: string[]
  warnings: string[]
  storageInstructions: string[]
  usageInstructions: string[]
  unreadableInformation: string[]
  missingInformation: string[]
  nutrition: NutritionFacts | null
}

/** The scan record returned to the UI. */
export interface ScanRecord {
  id: string
  productName: string | null
  brand: string | null
  category: string | null
  imageUrl: string | null
  createdAt: string
  report: ProductReport
}

export interface ScanQuestionRecord {
  id: string
  question: string
  answer: string
  createdAt: string
}

export interface ScanDetail {
  scan: ScanRecord
  questions: ScanQuestionRecord[]
}
