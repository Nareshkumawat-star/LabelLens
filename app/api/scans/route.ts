import { NextResponse } from "next/server"

import { connectMongoDB, isMongoConfigured } from "@/lib/mongodb"
import { getCurrentUserId } from "@/lib/auth"
import { Scan } from "@/models/Scan"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  // Guests have no server-side history — the app stores nothing for them.
  const userId = await getCurrentUserId()
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Sign in to load your scan history.", code: "UNAUTHENTICATED" },
      { status: 401 }
    )
  }

  if (!isMongoConfigured()) {
    return NextResponse.json(
      { success: false, error: "MONGODB_URI is not set.", code: "DB_NOT_CONFIGURED" },
      { status: 503 }
    )
  }

  try {
    await connectMongoDB()
    // Ownership filter: this account can only ever read its own scans.
    const docs = await Scan.find({ userId })
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
