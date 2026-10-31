import { GoogleGenAI } from "@google/genai"

/**
 * Server-only Gemini client.
 *
 * The API key never leaves this module — no NEXT_PUBLIC_ prefix anywhere.
 *
 * Model selection: the brief targets Gemma 4 image understanding through the
 * Gemini API. Model IDs change and availability differs per key/region, so
 * the ID comes from GEMMA_MODEL. If the configured model rejects image input
 * we surface that error to the caller instead of silently falling back to a
 * different model.
 */
const API_KEY = process.env.GEMINI_API_KEY
const MODEL = process.env.GEMMA_MODEL || "gemini-2.0-flash"

let client: GoogleGenAI | null = null

export class AIConfigError extends Error {
  code = "AI_NOT_CONFIGURED"
  status = 503
}

export class AIResponseError extends Error {
  code = "AI_BAD_RESPONSE"
  status = 502
  issues: string[]

  constructor(message: string, issues: string[] = []) {
    super(message)
    this.issues = issues
  }
}

export function isAIConfigured(): boolean {
  return Boolean(API_KEY)
}

function getClient(): GoogleGenAI {
  if (!API_KEY) {
    throw new AIConfigError(
      "GEMINI_API_KEY is not set. Add it to your environment before analyzing images."
    )
  }
  if (!client) client = new GoogleGenAI({ apiKey: API_KEY })
  return client
}

export async function generateFromImage(
  buffer: Buffer,
  mimeType: string,
  prompt: string
): Promise<string> {
  const ai = getClient()

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          { inlineData: { mimeType, data: buffer.toString("base64") } },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      temperature: 0.1,
    },
  })

  const text = response.text?.trim()
  if (!text) {
    throw new AIResponseError("The model returned an empty response.")
  }
  return text
}

export async function generateText(prompt: string): Promise<string> {
  const ai = getClient()

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: { temperature: 0.2 },
  })

  const text = response.text?.trim()
  if (!text) {
    throw new AIResponseError("The model returned an empty response.")
  }
  return text
}

export function getModelId(): string {
  return MODEL
}
