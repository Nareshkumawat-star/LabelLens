import Link from "next/link"

import { siteConfig } from "@/config/site"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { MainNav } from "@/components/main-nav"
import { ThemeToggle } from "@/components/theme-toggle"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 transition-all">
      <div className="container flex h-16 items-center justify-between">
        <MainNav items={siteConfig.mainNav} />
        
        <div className="flex items-center space-x-2">
          {/* GitHub option */}
          <Link
            href={siteConfig.links.github}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
              className: "h-9 gap-2 px-3 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors",
            })}
          >
            <Icons.gitHub className="h-4 w-4" />
            <span className="hidden sm:inline">GitHub</span>
            <span className="sr-only">GitHub</span>
          </Link>

          <div className="h-4 w-[1px] bg-border/60" />

          {/* Theme switch */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
