"use client"

import * as React from "react"
import { UploadCloud, Camera, X, Loader2, AlertCircle, FileText } from "lucide-react"

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

  // In-app camera (getUserMedia). The `capture` attribute only hints the mobile
  // OS camera app and is ignored on desktop, so we open a real live preview instead.
  const [cameraOpen, setCameraOpen] = React.useState(false)
  const [cameraStarting, setCameraStarting] = React.useState(false)
  const [cameraError, setCameraError] = React.useState<string | null>(null)
  const [stream, setStream] = React.useState<MediaStream | null>(null)
  const videoRef = React.useRef<HTMLVideoElement>(null)

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
      setError("Unsupported format. Please select a JPG, PNG, or WEBP image.")
      setStatus("error")
      return
    }
    if (candidate.size > MAX_BYTES) {
      setError(`Image size is ${(candidate.size / 1024 / 1024).toFixed(2)} MB. The maximum allowed is 5 MB.`)
      setStatus("error")
      return
    }
    setError(null)
    setFile(candidate)
    setPreviewFor(candidate)
    setStatus("ready")
  }

  // Attach the live stream once the <video> element is mounted.
  React.useEffect(() => {
    const video = videoRef.current
    if (!video || !stream) return
    video.srcObject = stream
    void video.play().catch(() => {})
  }, [stream, cameraOpen])

  // Release the camera hardware on unmount.
  React.useEffect(() => {
    return () => {
      setStream((current) => {
        current?.getTracks().forEach((track) => track.stop())
        return null
      })
    }
  }, [])

  const stopCamera = React.useCallback(() => {
    setStream((current) => {
      current?.getTracks().forEach((track) => track.stop())
      return null
    })
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraOpen(false)
  }, [])

  const openCamera = async () => {
    setError(null)
    setCameraError(null)
    const media =
      typeof navigator !== "undefined" && navigator.mediaDevices
        ? navigator.mediaDevices
        : null

    // No camera API at all (old browser, or insecure origin): fall back to the
    // native capture input, which still opens the phone camera on mobile.
    if (!media?.getUserMedia) {
      cameraInput.current?.click()
      return
    }

    setCameraOpen(true)
    setCameraStarting(true)

    try {
      const next = await media.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      })
      setStream(next)
    } catch (err) {
      const name = err instanceof Error ? err.name : ""
      const reason =
        name === "NotAllowedError"
          ? "Camera permission was blocked. Allow camera access for this site and try again."
          : name === "NotFoundError"
            ? "No camera was found on this device."
            : name === "NotReadableError"
              ? "The camera is already in use by another application."
              : "The camera could not be opened."
      setCameraOpen(false)
      setCameraError(reason + " You can still upload a photo from your device.")
    } finally {
      setCameraStarting(false)
    }
  }

  const capturePhoto = () => {
    const video = videoRef.current
    if (!video || !video.videoWidth) return

    const maxEdge = 1600
    const scale = Math.min(1, maxEdge / Math.max(video.videoWidth, video.videoHeight))
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(video.videoWidth * scale)
    canvas.height = Math.round(video.videoHeight * scale)

    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError("Could not capture the photo. Please try again.")
          setStatus("error")
          return
        }
        const captured = new File([blob], `label-${Date.now()}.jpg`, { type: "image/jpeg" })
        stopCamera()
        accept(captured)
      },
      "image/jpeg",
      0.92
    )
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
      setError("Network error while communicating with analysis service.")
      setStatus("error")
    }
  }

  return (
    <Card className="border bg-card shadow-xs">
      <CardContent className="p-6 space-y-4">
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
            className={`rounded-xl border border-dashed p-10 text-center transition-colors ${
              dragging ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/40 bg-muted/10"
            }`}
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border bg-background shadow-2xs">
              <UploadCloud className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm font-bold text-foreground">Drag and drop food label photo here</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Supports JPG, PNG, WEBP up to 5 MB · Ephemeral in-memory inspection
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2.5">
              <Button size="sm" onClick={() => fileInput.current?.click()} className="shadow-2xs">
                <UploadCloud className="mr-2 h-4 w-4" /> Choose File
              </Button>
              <Button size="sm" variant="outline" onClick={openCamera}>
                <Camera className="mr-2 h-4 w-4" /> Open Camera
              </Button>
            </div>
            {cameraError && (
              <div className="mx-auto mt-3 flex max-w-md items-start justify-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-2 text-left text-xs text-destructive">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}
          </div>
        )}

        {preview && (
          <div className="space-y-4">
            <div className="relative mx-auto overflow-hidden rounded-xl border bg-muted/20 p-2 text-center max-w-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Selected label preview"
                className="mx-auto max-h-72 rounded-lg object-contain"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate text-xs font-medium text-foreground">{file?.name}</span>
                {file && (
                  <span className="text-[11px] tabular-nums text-muted-foreground shrink-0">
                    ({(file.size / 1024).toFixed(0)} KB)
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => fileInput.current?.click()}>
                  Replace
                </Button>
                <Button size="sm" variant="ghost" className="h-8 text-xs text-muted-foreground hover:text-destructive" onClick={reset}>
                  <X className="mr-1 h-3.5 w-3.5" /> Remove
                </Button>
              </div>
            </div>
            <Button
              onClick={analyze}
              disabled={status === "analyzing"}
              className="w-full font-semibold shadow-xs"
            >
              {status === "analyzing" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing Label with Gemma…
                </>
              ) : (
                "Run Truth Mode Analysis"
              )}
            </Button>
          </div>
        )}

        {cameraOpen && (
          <div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/80 p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Camera capture"
          >
            <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-white/15 bg-black">
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="h-auto max-h-[70vh] w-full object-contain"
              />
              {cameraStarting && (
                <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-white">
                  <Loader2 className="h-4 w-4 animate-spin" /> Starting camera…
                </div>
              )}
            </div>
            <p className="max-w-sm text-center text-xs text-white/70">
              Point the camera at the product label, then press Capture.
            </p>
            <div className="flex items-center gap-2">
              <Button onClick={capturePhoto} disabled={cameraStarting || !stream}>
                <Camera className="mr-2 h-4 w-4" /> Capture
              </Button>
              <Button variant="outline" onClick={stopCamera}>
                <X className="mr-2 h-4 w-4" /> Cancel
              </Button>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <div className="space-y-2">
              <p className="text-destructive font-medium">{error}</p>
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
