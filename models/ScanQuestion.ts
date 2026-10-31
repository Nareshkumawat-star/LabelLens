import mongoose, { Schema, type Model } from "mongoose"

/**
 * One "Ask Your Label" turn, kept per scan so conversation history survives
 * a page reload.
 */
const ScanQuestionSchema = new Schema(
  {
    scanId: { type: Schema.Types.ObjectId, ref: "Scan", required: true, index: true },
    question: { type: String, required: true, trim: true, maxlength: 500 },
    answer: { type: String, required: true, trim: true, maxlength: 4000 },
  },
  { timestamps: true }
)

ScanQuestionSchema.index({ scanId: 1, createdAt: 1 })

export const ScanQuestion: Model<mongoose.InferSchemaType<typeof ScanQuestionSchema>> =
  mongoose.models.ScanQuestion || mongoose.model("ScanQuestion", ScanQuestionSchema)
