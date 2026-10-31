"use client"

import * as React from "react"
import {
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Lock,
  MessageSquare,
} from "lucide-react"
import { AccordionApp, type AccordionItemData } from "./card-split-accordian"

const ACCORDION_ITEMS: AccordionItemData[] = [
  {
    id: 1,
    title: "What is LabelLens and how does it work?",
    icon: <ScanLine className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
    content:
      "LabelLens is a simple food scanner that helps you see what is really inside packaged food. Take a photo of any food package or ingredient label, and LabelLens reads the printed text to find hidden sugars, artificial chemicals, and tell you if it is clean and safe to eat.",
  },
  {
    id: 2,
    title: "How does LabelLens check if food is good or healthy to eat?",
    icon: <CheckCircle2 className="h-5 w-5 text-teal-600 dark:text-teal-400 shrink-0" />,
    content:
      "LabelLens calculates a simple 0 to 100 Purity Score based on the printed ingredients. Real whole-food ingredients increase the score, while hidden sugars (like maltodextrin), chemical preservatives, and artificial dyes lower the score.",
  },
  {
    id: 3,
    title: "Can LabelLens warn me about food allergies?",
    icon: <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />,
    content:
      "Yes! LabelLens automatically checks every label for common allergens like peanuts, tree nuts, milk/dairy, eggs, wheat/gluten, soy, fish, shellfish, and sesame. If an allergen is found in the ingredients or printed warning label, you get an immediate alert.",
  },
  {
    id: 4,
    title: "How do I scan a food label?",
    icon: <Camera className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />,
    content:
      "Click 'Check Food Label Now' or go to the Scan page. You can take a live photo using your phone or webcam, or simply drag and drop any packaging picture from your computer or camera roll.",
  },
  {
    id: 5,
    title: "Are my food photos kept private?",
    icon: <Lock className="h-5 w-5 text-sky-600 dark:text-sky-400 shrink-0" />,
    content:
      "Yes, 100% private. Photos are only scanned in temporary memory to read the label text and are deleted right away. Your food photos are never stored on any servers or shared with anyone.",
  },
  {
    id: 6,
    title: "Can I ask questions about my food after scanning?",
    icon: <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0" />,
    content:
      "Yes! After scanning any label, you can use the 'Ask Your Label' chat feature to ask simple questions like 'Is this safe for diabetics?', 'Does this have artificial sweeteners?', or 'Is this vegan?' and get clear, instant answers.",
  },
]

export function WatermelonFaqAccordion() {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Simple answers to common questions about using LabelLens to scan and understand packaged food.
          </p>
        </div>
        <span className="self-start sm:self-center rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
          Quick Help & FAQs
        </span>
      </div>

      <AccordionApp items={ACCORDION_ITEMS} className="p-0" listClassName="w-full space-y-2" />
    </div>
  )
}

