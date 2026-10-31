"use client"

import * as React from "react"
import { ReactLenis, useLenis } from "lenis/react"
import { ArrowUp } from "lucide-react"
import "lenis/dist/lenis.css"

import { cn } from "@/lib/utils"

interface SmoothScrollProviderProps {
  children: React.ReactNode
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.09,
        duration: 1.2,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
      }}
    >
      <ScrollProgressBar />
      {children}
      <ScrollToTopButton />
    </ReactLenis>
  )
}

/**
 * Aesthetic top progress indicator tracking Lenis scroll position
 */
export function ScrollProgressBar() {
  const [progress, setProgress] = React.useState(0)

  useLenis((lenis) => {
    if (lenis.limit > 0) {
      const p = Math.min(1, Math.max(0, lenis.scroll / lenis.limit))
      setProgress(p)
    }
  })

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 right-0 z-50 h-[2.5px] bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-emerald-500 via-primary to-teal-500 transition-[width] duration-75 ease-out"
        style={{ width: `${(progress * 100).toFixed(1)}%` }}
      />
    </div>
  )
}

/**
 * Aesthetic floating scroll-to-top button powered by Lenis
 */
export function ScrollToTopButton() {
  const [visible, setVisible] = React.useState(false)
  const lenis = useLenis(({ scroll }) => {
    setVisible(scroll > 360)
  })

  const handleScrollToTop = () => {
    lenis?.scrollTo(0, { duration: 1.2 })
  }

  return (
    <button
      type="button"
      onClick={handleScrollToTop}
      aria-label="Scroll back to top"
      className={cn(
        "fixed bottom-6 right-6 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-card/90 text-foreground shadow-md backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-primary/50 hover:bg-card focus:outline-hidden",
        visible
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "translate-y-4 opacity-0 pointer-events-none"
      )}
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  )
}

/**
 * Hook to scroll smoothly to any element selector or numeric offset using Lenis
 */
export function useSmoothScroll() {
  const lenis = useLenis()

  const scrollTo = React.useCallback(
    (target: string | number | HTMLElement, offset: number = -65) => {
      lenis?.scrollTo(target, {
        offset,
        duration: 1.2,
      })
    },
    [lenis]
  )

  return { lenis, scrollTo }
}
