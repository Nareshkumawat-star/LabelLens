"use client"

import * as React from "react"
import { Eye, Layers, Send, Sparkles, HelpCircle } from "lucide-react"
import { AccordionApp, type AccordionItemData } from "./card-split-accordian"

const ACCORDION_ITEMS: AccordionItemData[] = [
  {
    id: 1,
    title: "How does Label Truth Mode eliminate AI hallucination?",
    icon: <Eye className="h-5 w-5 text-emerald-500 shrink-0" />,
    content:
      "Traditional AI often guesses missing ingredients or fabricates marketing claims. LabelLens strictly separates text verbatim printed on the packaging from AI-assisted scientific explanations. If text is blurry or cropped, it is explicitly segregated into 'Not Verified'.",
  },
  {
    id: 2,
    title: "What criteria flag synthetic additives and allergens?",
    icon: <Layers className="h-5 w-5 text-blue-500 shrink-0" />,
    content:
      "Ingredients are parsed against standard regulatory lists for the Big 9 allergens (peanuts, tree nuts, gluten, dairy, soy, eggs, fish, shellfish, sesame), high-fructose corn syrups, synthetic artificial dyes (Red 40, Yellow 5), and artificial sweeteners.",
  },
  {
    id: 3,
    title: "How does multimodal vision operate with privacy-by-design?",
    icon: <Send className="h-5 w-5 text-purple-500 shrink-0" />,
    content:
      "Photos of labels are processed strictly in ephemeral memory buffers. Once the multimodal model generates the structured report, the raw image bytes are purged. Only structured JSON metrics are retained for your history.",
  },
  {
    id: 4,
    title: "How do I query specific dietary suitability with Ask Your Label?",
    icon: <Sparkles className="h-5 w-5 text-amber-500 shrink-0" />,
    content:
      "After scanning any label, use the 'Ask Your Label' chat drawer. Ask questions such as 'Is this safe for gestational diabetes?', 'Does this have hidden dairy derivatives?', or 'What is the protein-to-calorie ratio?' for grounded answers.",
  },
]

export function WatermelonFaqAccordion() {
  return (
    <div className="rounded-2xl border bg-card/60 p-6 shadow-sm backdrop-blur-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
              Watermelon Animated UI
            </span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              Card-Split Interaction
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground mt-1">
            Label Intelligence & Verification Architecture
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Click any topic below to experience the smooth spring-animated card split disclosure.
          </p>
        </div>
      </div>

      <AccordionApp items={ACCORDION_ITEMS} className="p-0" listClassName="w-full space-y-2" />
    </div>
  )
}
