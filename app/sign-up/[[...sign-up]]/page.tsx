import { SignUp } from "@clerk/nextjs"

import { isClerkConfigured } from "@/lib/auth"

export default function SignUpPage() {
  if (!isClerkConfigured()) {
    return (
      <div className="container max-w-md space-y-2 py-16 text-center">
        <h1 className="text-lg font-bold">Sign up is not configured</h1>
        <p className="text-sm text-muted-foreground">
          Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY to enable accounts.
          Until then LabelLens runs in guest mode and does not store scans.
        </p>
      </div>
    )
  }

  return (
    <div className="flex justify-center py-12">
      <SignUp />
    </div>
  )
}
