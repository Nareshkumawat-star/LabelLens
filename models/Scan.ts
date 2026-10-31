import mongoose, { Schema, type Model } from "mongoose"

/**
 * A saved label scan.
 *
 * Only the structured report and metadata are stored. The uploaded image is
 * NOT persisted: it exists in memory for the duration of the Gemini call and
 * is then discarded. Nothing here claims the image is retained.
 */
const IngredientSchema = new Schema(
  {
    name: { type: String, required: true },
    sourceText: { type: String, default: "" },
    purpose: { type: String, default: "" },
    explanation: { type: String, default: "" },
    confidence: { type: String, enum: ["high", "medium", "low"], default: "medium" },
    flag: {
      type: String,
      enum: ["none", "allergen", "high-sugar", "high-sodium", "high-fat", "additive"],
      default: "none",
    },
  },
  { _id: false }
)

const NutritionSchema = new Schema(
  {
    servingSize: { type: String, default: null },
    servingsPerContainer: { type: String, default: null },
    calories: { type: String, default: null },
    protein: { type: String, default: null },
    carbohydrates: { type: String, default: null },
    sugars: { type: String, default: null },
    fat: { type: String, default: null },
    saturatedFat: { type: String, default: null },
    sodium: { type: String, default: null },
    fiber: { type: String, default: null },
  },
  { _id: false }
)

const ReportSchema = new Schema(
  {
    productName: { type: String, default: null },
    brand: { type: String, default: null },
    category: { type: String, default: null },
    summary: { type: String, default: "" },
    confidence: { type: String, enum: ["high", "medium", "low"], default: "medium" },
    onLabel: {
      ingredientsText: { type: [String], default: [] },
      allergenDeclarations: { type: [String], default: [] },
      warnings: { type: [String], default: [] },
      storageInstructions: { type: [String], default: [] },
      usageInstructions: { type: [String], default: [] },
      ingredientsListed: { type: Boolean, default: false },
      allergensListed: { type: Boolean, default: false },
      nutritionVisible: { type: Boolean, default: false },
      expiryDate: { type: String, default: null },
    },
    ingredients: { type: [IngredientSchema], default: [] },
    allergens: { type: [String], default: [] },
    warnings: { type: [String], default: [] },
    storageInstructions: { type: [String], default: [] },
    usageInstructions: { type: [String], default: [] },
    unreadableInformation: { type: [String], default: [] },
    missingInformation: { type: [String], default: [] },
    nutrition: { type: NutritionSchema, default: null },
  },
  { _id: false }
)

const ScanSchema = new Schema(
  {
    productName: { type: String, default: null },
    brand: { type: String, default: null },
    category: { type: String, default: null },
    imageUrl: { type: String, default: null },
    report: { type: ReportSchema, required: true },
  },
  { timestamps: true }
)

ScanSchema.index({ createdAt: -1 })

export const Scan: Model<mongoose.InferSchemaType<typeof ScanSchema>> =
  mongoose.models.Scan || mongoose.model("Scan", ScanSchema)
