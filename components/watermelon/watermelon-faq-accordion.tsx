"use client"

import * as React from "react"
import { Eye, Layers, Send, Sparkles } from "lucide-react"
import { AccordionApp, type AccordionItemData } from "./card-split-accordian"

const ACCORDION_ITEMS: AccordionItemData[] = [
  {
    id: 1,
    title: "How does Label Truth Mode eliminate AI hallucination?",
    icon: <Eye className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
    content:
      "Traditional AI often guesses missing ingredients or fabricates marketing claims. LabelLens strictly separates text verbatim printed on packaging from AI-assisted scientific explanations. If text is blurry or cropped, it is explicitly segregated into 'Not Verified'.",
  },
  {
    id: 2,
    title: "What criteria flag synthetic additives and allergens?",
    icon: <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />,
    content:
      "Ingredients are parsed against standard regulatory lists for the Big 9 allergens (peanuts, tree nuts, gluten, dairy, soy, eggs, fish, shellfish, sesame), high-fructose corn syrups, synthetic artificial dyes (Red 40, Yellow 5), and artificial sweeteners.",
  },
  {
    id: 3,
    title: "How does multimodal vision operate with privacy-by-design?",
    icon: <Send className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0" />,
    content:
      "Photos of labels are processed strictly in ephemeral memory buffers. Once the multimodal vision model completes generating the structured JSON report, the raw image bytes are purged. Only structured metrics are retained in your local history.",
  },
  {
    id: 4,
    title: "How do I query specific dietary suitability with Ask Your Label?",
    icon: <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />,
    content:
      "After scanning any label, use the 'Ask Your Label' chat drawer. Ask questions such as 'Is this safe for gestational diabetes?', 'Does this have hidden dairy derivatives?', or 'What is the protein-to-calorie ratio?' for grounded answers.",
  },
]

export function WatermelonFaqAccordion() {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Label Intelligence & Verification Architecture
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Explore how LabelLens parses nutrition tables, handles ephemeral memory, and enforces verified ground truth.
          </p>
        </div>
        <span className="self-start sm:self-center rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
          Watermelon Card-Split
        </span>
      </div>

      <AccordionApp items={ACCORDION_ITEMS} className="p-0" listClassName="w-full space-y-2" />
    </div>
  )
}
