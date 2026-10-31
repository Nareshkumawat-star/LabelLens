import { auth } from "@clerk/nextjs/server"

/**
 * Clerk is optional at runtime: without keys the app runs in guest mode and
 * nothing is persisted. With keys, every scan is scoped to its account.
 */
export function isClerkConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
  )
}

/**
 * The signed-in Clerk user id, or null for guests.
 * Never throws — an auth failure degrades to guest rather than a 500.
 */
export async function getCurrentUserId(): Promise<string | null> {
  if (!isClerkConfigured()) return null
  try {
    const { userId } = await auth()
    return userId ?? null
  } catch {
    return null
  }
}
