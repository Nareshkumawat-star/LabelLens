"use client"

import * as React from "react"
import { UploadCloud, Camera, X, Loader2, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { ScanRecord } from "@/lib/types"

const ALLOWED = ["image/jpeg", "image/png", "image/webp"]
const MAX_BYTES = 5 * 1024 * 1024

interface Props {
  onAnalyzed: (scan: ScanRecord) => void
}

type Status = "idle" | "ready" | "analyzing" | "error"

export function ImageUploader({ onAnalyzed }: Props) {
  const [status, setStatus] = React.useState<Status>("idle")
  const [file, setFile] = React.useState<File | null>(null)
  const [preview, setPreview] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [dragging, setDragging] = React.useState(false)

  const fileInput = React.useRef<HTMLInputElement>(null)
  const cameraInput = React.useRef<HTMLInputElement>(null)

  // Object URLs must be revoked when replaced or unmounted.
  const setPreviewFor = React.useCallback((next: File | null) => {
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old)
      return next ? URL.createObjectURL(next) : null
    })
  }, [])

  React.useEffect(() => {
    return () => {
      setPreview((old) => {
        if (old) URL.revokeObjectURL(old)
        return null
      })
    }
  }, [])

  const accept = (candidate: File) => {
    if (!ALLOWED.includes(candidate.type)) {
      setError("Unsupported format. Please use JPG, PNG or WEBP.")
      setStatus("error")
      return
    }
    if (candidate.size > MAX_BYTES) {
      setError(`That image is ${(candidate.size / 1024 / 1024).toFixed(2)} MB. The limit is 5 MB.`)
      setStatus("error")
      return
    }
    setError(null)
    setFile(candidate)
    setPreviewFor(candidate)
    setStatus("ready")
  }

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0]
    if (picked) accept(picked)
    e.target.value = ""
  }

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files?.[0]
    if (dropped) accept(dropped)
  }

  const reset = () => {
    setFile(null)
    setPreviewFor(null)
    setError(null)
    setStatus("idle")
  }

  const analyze = async () => {
    if (!file) return
    setStatus("analyzing")
    setError(null)

    try {
      const form = new FormData()
      form.append("image", file)

      const res = await fetch("/api/analyze", { method: "POST", body: form })
      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(
          [data?.error, ...(Array.isArray(data?.details) ? data.details : [])]
            .filter(Boolean)
            .join(" — ") || `Analysis failed (HTTP ${res.status}).`
        )
        setStatus("error")
        return
      }

      onAnalyzed(data.scan as ScanRecord)
      setStatus("idle")
      setFile(null)
      setPreviewFor(null)
    } catch {
      setError("Network error. Check your connection and try again.")
      setStatus("error")
    }
  }

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold">Upload a product label</h2>
          <p className="text-xs text-muted-foreground">
            JPG, PNG or WEBP · up to 5 MB. The photo is sent to the model for analysis and is not
            stored.
          </p>
        </div>

        <input ref={fileInput} type="file" accept={ALLOWED.join(",")} className="hidden" onChange={onPick} />
        <input
          ref={cameraInput}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={onPick}
        />

        {!preview && status !== "error" && (
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
              dragging ? "border-primary bg-primary/5" : "border-border"
            }`}
          >
            <UploadCloud className="mx-auto h-9 w-9 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">Drop your product image here</p>
            <p className="text-xs text-muted-foreground">Upload a clear photo of the label</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button size="sm" onClick={() => fileInput.current?.click()}>
                <UploadCloud className="mr-2 h-4 w-4" /> Upload Image
              </Button>
              <Button size="sm" variant="outline" onClick={() => cameraInput.current?.click()}>
                <Camera className="mr-2 h-4 w-4" /> Take Photo
              </Button>
            </div>
          </div>
        )}

        {preview && (
          <div className="space-y-3">
            {/* Blob preview — not a stored asset. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Selected label preview"
              className="mx-auto max-h-64 rounded-lg border object-contain"
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="truncate text-xs text-muted-foreground">{file?.name}</span>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => fileInput.current?.click()}>
                  Replace
                </Button>
                <Button size="sm" variant="ghost" onClick={reset}>
                  <X className="mr-1 h-3.5 w-3.5" /> Remove
                </Button>
              </div>
            </div>
            <Button onClick={analyze} disabled={status === "analyzing"} className="w-full">
              {status === "analyzing" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing label…
                </>
              ) : (
                "Analyze Product"
              )}
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <div className="space-y-2">
              <p>{error}</p>
              <Button size="sm" variant="outline" onClick={reset}>
                Try again
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
