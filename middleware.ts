import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

import { isClerkConfigured } from "@/lib/auth"

/** History and saved-scan views need an account; the scanner stays public. */
const isProtectedRoute = createRouteMatcher(["/history(.*)", "/scan/:id(.*)"])

export default isClerkConfigured()
  ? clerkMiddleware(async (auth, req) => {
      if (isProtectedRoute(req)) await auth.protect()
    })
  : // No Clerk keys configured: run as a pure guest app with no protected routes.
    () => Promise.resolve()

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
