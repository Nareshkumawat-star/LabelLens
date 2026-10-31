import { NextResponse } from "next/server"

import { connectMongoDB, isMongoConfigured } from "@/lib/mongodb"
import { Scan } from "@/models/Scan"
import { ScanQuestion } from "@/models/ScanQuestion"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type Ctx = { params: { id: string } }

export async function GET(_request: Request, { params }: Ctx) {
  if (!isMongoConfigured()) {
    return NextResponse.json(
      { success: false, error: "MONGODB_URI is not set.", code: "DB_NOT_CONFIGURED" },
      { status: 503 }
    )
  }

  try {
    await connectMongoDB()
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: `Database unavailable: ${err instanceof Error ? err.message : String(err)}`,
        code: "DB_ERROR",
      },
      { status: 500 }
    )
  }

  try {
    const scan = await Scan.findById(params.id).lean()
    if (!scan) {
      return NextResponse.json(
        { success: false, error: "Scan not found.", code: "SCAN_NOT_FOUND" },
        { status: 404 }
      )
    }

    const questions = await ScanQuestion.find({ scanId: params.id }).sort({ createdAt: 1 }).lean()

    return NextResponse.json({
      success: true,
      scan: {
        id: String(scan._id),
        productName: scan.productName ?? null,
        brand: scan.brand ?? null,
        category: scan.category ?? null,
        imageUrl: scan.imageUrl ?? null,
        createdAt: scan.createdAt?.toISOString?.() ?? new Date().toISOString(),
        report: scan.report,
      },
      questions: questions.map((q) => ({
        id: String(q._id),
        question: q.question,
        answer: q.answer,
        createdAt: q.createdAt?.toISOString?.() ?? new Date().toISOString(),
      })),
    })
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid scan id.", code: "INVALID_ID" },
      { status: 400 }
    )
  }
}

export async function DELETE(_request: Request, { params }: Ctx) {
  if (!isMongoConfigured()) {
    return NextResponse.json(
      { success: false, error: "MONGODB_URI is not set.", code: "DB_NOT_CONFIGURED" },
      { status: 503 }
    )
  }

  try {
    await connectMongoDB()
    const deleted = await Scan.findByIdAndDelete(params.id)
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Scan not found.", code: "SCAN_NOT_FOUND" },
        { status: 404 }
      )
    }
    await ScanQuestion.deleteMany({ scanId: params.id })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid scan id.", code: "INVALID_ID" },
      { status: 400 }
    )
  }
}
