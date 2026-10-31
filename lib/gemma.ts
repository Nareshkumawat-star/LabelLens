import { GoogleGenAI } from "@google/genai"

/**
 * Server-only Gemini client.
 *
 * The API key never leaves this module — no NEXT_PUBLIC_ prefix anywhere.
 *
 * Model selection: the brief targets Gemma 4 image understanding through the
 * Gemini API. Model IDs change and availability differs per key/region, so
 * the ID comes from GEMMA_MODEL. We validate the configured model against the
 * API before any generate call so a retired ID fails fast with a real error
 * instead of silently falling back to a different model.
 */

const API_KEY = process.env.GEMINI_API_KEY
const MODEL = (process.env.GEMMA_MODEL || "gemini-2.5-flash").trim()
/**
 * The model id the API actually serves for your key/region. The default below
 * is what works today; if Google retires it, the startup validation will
 * report the exact reason instead of a 404 deep in the call.
 */
const VALIDATION_CHAIN = process.env.GEMMA_MODEL_VALIDATION_CHAIN
  ? process.env.GEMMA_MODEL_VALIDATION_CHAIN.split(",").map((m) => m.trim()).filter(Boolean)
  : ["gemini-2.5-flash", "gemini-3.8-flash"]

let client: GoogleGenAI | null = null
let modelIdValidated = false

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

/**
 * Check that one of the configured model IDs is available on this key/region.
 * Fails fast with a real error if every candidate is retired (e.g. a 404).
 */
async function validateModelId(): Promise<void> {
  if (modelIdValidated) return
  const ai = getClient()
  const errors: string[] = []

  for (const candidate of VALIDATION_CHAIN) {
    try {
      await ai.models.get({ model: candidate })
      modelIdValidated = true
      return
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      errors.push(`${candidate}: ${message}`)
    }
  }

  throw new AIConfigError(
    `No configured model is available on this key/region (GEMMA_MODEL_VALIDATION_CHAIN=${VALIDATION_CHAIN.join(",")}).\nDetails:\n${errors.map((e) => `  - ${e}`).join("\n")}`
  )
}

export async function generateFromImage(
  buffer: Buffer,
  mimeType: string,
  prompt: string
): Promise<string> {
  await validateModelId()
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
  await validateModelId()
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
