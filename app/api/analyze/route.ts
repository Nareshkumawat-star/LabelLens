import { NextResponse } from "next/server"

import { connectMongoDB, isMongoConfigured } from "@/lib/mongodb"
import { generateFromImage, isAIConfigured, AIConfigError, AIResponseError } from "@/lib/gemma"
import { buildAnalysisPrompt } from "@/lib/prompts"
import { parseAIOutput } from "@/lib/schema"
import { Scan } from "@/models/Scan"

export const runtime = "nodejs"
export const maxDuration = 60

const MAX_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp"]

function fail(error: string, code: string, status: number, details?: string[]) {
  return NextResponse.json({ success: false, error, code, details: details ?? [] }, { status })
}

export async function POST(request: Request) {
  if (!isAIConfigured()) {
    return fail(
      "The AI service is not configured. Set GEMINI_API_KEY on the server.",
      "AI_NOT_CONFIGURED",
      503
    )
  }

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return fail("Expected multipart/form-data with an 'image' field.", "INVALID_BODY", 400)
  }

  const file = form.get("image")
  if (!(file instanceof File)) {
    return fail("No image was uploaded.", "NO_FILE", 400)
  }

  if (!ALLOWED.includes(file.type)) {
    return fail(`Unsupported type "${file.type}". Use JPG, PNG or WEBP.`, "INVALID_TYPE", 415)
  }

  if (file.size > MAX_BYTES) {
    return fail(
      `Image is ${(file.size / 1024 / 1024).toFixed(2)} MB. Maximum is 5 MB.`,
      "FILE_TOO_LARGE",
      413
    )
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  // 1. Real multimodal analysis of the original image.
  let raw: string
  try {
    raw = await generateFromImage(buffer, file.type, buildAnalysisPrompt())
  } catch (err) {
    if (err instanceof AIConfigError) return fail(err.message, err.code, err.status)
    if (err instanceof AIResponseError) return fail(err.message, err.code, err.status, err.issues)
    return fail(
      `AI analysis failed: ${err instanceof Error ? err.message : String(err)}`,
      "AI_ERROR",
      502
    )
  }

  // 2. Validate the structured output before trusting it.
  const parsed = parseAIOutput(raw)
  if (!parsed.ok) {
    return fail(parsed.error, "AI_BAD_RESPONSE", 502, parsed.issues)
  }
  const report = parsed.report

  // 3. Persist the report (never the raw image).
  if (isMongoConfigured()) {
    try {
      await connectMongoDB()
      const doc = await Scan.create({
        productName: report.productName,
        brand: report.brand,
        category: report.category,
        imageUrl: null,
        report,
      })

      return NextResponse.json({
        success: true,
        saved: true,
        scan: {
          id: String(doc._id),
          productName: report.productName,
          brand: report.brand,
          category: report.category,
          imageUrl: null,
          createdAt: doc.createdAt?.toISOString?.() ?? new Date().toISOString(),
          report,
        },
      })
    } catch (err) {
      // Continue and return the in-memory scan report even if Mongo save fails
      console.error("MongoDB save error:", err)
    }
  }

  return NextResponse.json({
    success: true,
    saved: false,
    scan: {
      id: "",
      productName: report.productName,
      brand: report.brand,
      category: report.category,
      imageUrl: null,
      createdAt: new Date().toISOString(),
      report,
    },
  })
}
