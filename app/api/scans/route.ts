import { NextResponse } from "next/server"

import { connectMongoDB, isMongoConfigured } from "@/lib/mongodb"
import { Scan } from "@/models/Scan"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  if (!isMongoConfigured()) {
    return NextResponse.json({ success: true, scans: [] })
  }

  try {
    await connectMongoDB()
    const docs = await Scan.find()
      .sort({ createdAt: -1 })
      .limit(30)
      .select("productName brand category createdAt report")
      .lean()

    const scans = docs.map((d) => ({
      id: String(d._id),
      productName: d.productName ?? null,
      brand: d.brand ?? null,
      category: d.category ?? null,
      createdAt: d.createdAt?.toISOString?.() ?? new Date().toISOString(),
      summary: d.report?.summary ?? "",
    }))

    return NextResponse.json({ success: true, scans })
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: `Could not load scans: ${err instanceof Error ? err.message : String(err)}`,
        code: "DB_ERROR",
      },
      { status: 500 }
    )
  }
}
