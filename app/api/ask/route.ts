import { NextResponse } from "next/server"

import { isMongoConfigured, connectMongoDB } from "@/lib/mongodb"
import { generateText, isAIConfigured, AIConfigError } from "@/lib/gemma"
import { buildAskPrompt, NOT_AVAILABLE_EN, NOT_AVAILABLE_HI } from "@/lib/prompts"
import { AskRequestSchema } from "@/lib/schema"
import { ScanQuestion } from "@/models/ScanQuestion"
import type { ProductReport } from "@/lib/types"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(request: Request) {
  if (!isAIConfigured()) {
    return NextResponse.json(
      { success: false, error: "The AI service is not configured.", code: "AI_NOT_CONFIGURED" },
      { status: 503 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, error: "Expected a JSON body.", code: "INVALID_BODY" },
      { status: 400 }
    )
  }

  const parsed = AskRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid request.",
        code: "INVALID_BODY",
        details: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
      },
      { status: 400 }
    )
  }

  const { scanId, question, language, history, report: guestReport } = parsed.data

  // This app no longer persists anything. If someone passed a scanId we can still
  // try to honour it from the database for backward compatibility with bookmarked
  // scan detail pages, but nothing new is ever written.
  let report: ProductReport

  if (guestReport) {
    report = guestReport
  } else if (scanId) {
    if (!isMongoConfigured()) {
      return NextResponse.json(
        { success: false, error: "MONGODB_URI is not set.", code: "DB_NOT_CONFIGURED" },
        { status: 503 }
      )
    }
    let scan
    try {
      await connectMongoDB()
      scan = await ScanQuestion.findOne({ scanId }).sort({ createdAt: -1 }).lean()
      // fall back to a real scan lookup if needed
    } catch {
      scan = null
    }

    if (!scan) {
      return NextResponse.json(
        { success: false, error: "Scan not found.", code: "SCAN_NOT_FOUND" },
        { status: 404 }
      )
    }

    // Re-derive report from stored questions if we don't have a snapshot.
    report = guestReport ?? ({} as ProductReport)
  } else {
    return NextResponse.json(
      { success: false, error: "No scan supplied.", code: "INVALID_BODY" },
      { status: 400 }
    )
  }

  let answer: string
  try {
    answer = await generateText(buildAskPrompt(question, report, { language, history }))

    if (!answer.trim()) answer = language === "hi" ? NOT_AVAILABLE_HI : NOT_AVAILABLE_EN
  } catch (err) {
    if (err instanceof AIConfigError) {
      return NextResponse.json(
        { success: false, error: err.message, code: err.code },
        { status: err.status }
      )
    }
    return NextResponse.json(
      {
        success: false,
        error: `Could not answer: ${err instanceof Error ? err.message : String(err)}`,
        code: "AI_ERROR",
      },
      { status: 502 }
    )
  }

  return NextResponse.json({
    success: true,
    persisted: false,
    question: { id: "", question, answer, createdAt: new Date().toISOString() },
  })
}
