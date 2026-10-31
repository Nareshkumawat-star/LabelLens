import { NextResponse } from "next/server"

import { connectMongoDB, isMongoConfigured } from "@/lib/mongodb"
import { generateText, isAIConfigured, AIConfigError } from "@/lib/gemma"
import { buildAskPrompt, NOT_AVAILABLE_EN, NOT_AVAILABLE_HI } from "@/lib/prompts"
import { AskRequestSchema } from "@/lib/schema"
import { Scan } from "@/models/Scan"
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
  if (!isMongoConfigured()) {
    return NextResponse.json(
      { success: false, error: "MONGODB_URI is not set.", code: "DB_NOT_CONFIGURED" },
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

  const { scanId, question, language, history } = parsed.data

  let scan
  try {
    await connectMongoDB()
    scan = await Scan.findById(scanId).lean()
  } catch {
    return NextResponse.json(
      { success: false, error: "Scan not found.", code: "SCAN_NOT_FOUND" },
      { status: 404 }
    )
  }

  if (!scan) {
    return NextResponse.json(
      { success: false, error: "Scan not found.", code: "SCAN_NOT_FOUND" },
      { status: 404 }
    )
  }

  let answer: string
  try {
    // Lean documents widen optional fields to `undefined`; normalise to null so
    // the prompt receives a value that matches ProductReport exactly.
    const report = JSON.parse(JSON.stringify(scan.report)) as ProductReport
    answer = await generateText(buildAskPrompt(question, report, { language, history }))

    // Guard against a degenerate empty reply: never show a blank answer.
    if (!answer.trim()) answer = language === "hi" ? NOT_AVAILABLE_HI : NOT_AVAILABLE_EN
  } catch (err) {
    if (err instanceof AIConfigError) {
      return NextResponse.json(
        { success: false, error: err.message, code: err.code },
        { status: err.status }
      )
    }
    // A model failure must not fabricate an answer.
    return NextResponse.json(
      {
        success: false,
        error: `Could not answer: ${err instanceof Error ? err.message : String(err)}`,
        code: "AI_ERROR",
      },
      { status: 502 }
    )
  }

  try {
    const saved = await ScanQuestion.create({ scanId, question, answer })
    return NextResponse.json({
      success: true,
      question: {
        id: String(saved._id),
        question,
        answer,
        createdAt: saved.createdAt?.toISOString?.() ?? new Date().toISOString(),
      },
    })
  } catch {
    // The answer is still useful even if history could not be saved; say so.
    return NextResponse.json({
      success: true,
      persisted: false,
      question: { id: "", question, answer, createdAt: new Date().toISOString() },
    })
  }
}
