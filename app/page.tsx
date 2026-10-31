"use client"

import * as React from "react"
import { ScanLine, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { ImageUploader } from "@/components/label-lens/image-uploader"
import { ReportView } from "@/components/label-lens/report-view"
import { AskYourLabel } from "@/components/label-lens/ask-your-label"
import { ScanHistory } from "@/components/label-lens/scan-history"
import type { ScanRecord } from "@/lib/types"

export default function IndexPage() {
  const [scan, setScan] = React.useState<ScanRecord | null>(null)
  const [refreshKey, setRefreshKey] = React.useState(0)

  const onAnalyzed = (next: ScanRecord) => {
    setScan(next)
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="container max-w-6xl space-y-8 py-8">
      <header className="space-y-2 border-b pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-lg font-black text-primary-foreground">
            L
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">LabelLens</h1>
          <Badge variant="outline" className="text-xs">
            multimodal
          </Badge>
        </div>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Understand what&apos;s inside. Scan a product label and see what is printed on the package,
          what the AI is explaining, and what could not be verified.
        </p>
      </header>

      <ImageUploader onAnalyzed={onAnalyzed} />

      {scan ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <ReportView report={scan.report} />
          </div>
          <div className="space-y-6">
            <AskYourLabel scanId={scan.id} />
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <ScanLine className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">No label analyzed yet</p>
          <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
            Upload or photograph a product label above. The photo goes to the multimodal model, the
            structured result is validated, and then it appears here.
          </p>
        </div>
      )}

      <ScanHistory refreshKey={refreshKey} />

      <footer className="flex flex-wrap items-center gap-2 border-t pt-6 text-xs text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span>
          LabelLens is an informational tool. It is not medical advice, and it does not judge whether
          a product is safe or healthy.
        </span>
      </footer>
    </div>
  )
}
