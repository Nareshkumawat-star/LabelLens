import mongoose from "mongoose"

/**
 * Cached Mongoose connection.
 *
 * Next.js route handlers can be re-invoked across hot reloads and cold starts;
 * caching the promise on globalThis avoids opening a new pool each time.
 */
const MONGODB_URI = process.env.MONGODB_URI

type Cache = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var
  var _labellens: Cache | undefined
}

const cached: Cache = globalThis._labellens ?? (globalThis._labellens = { conn: null, promise: null })

export function isMongoConfigured(): boolean {
  return Boolean(MONGODB_URI)
}

export async function connectMongoDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set.")
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15_000,
      maxPoolSize: 10,
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (err) {
    cached.promise = null
    throw err
  }

  return cached.conn
}

export { mongoose }
