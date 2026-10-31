import Link from "next/link"
import { History, ScanLine } from "lucide-react"

import { siteConfig } from "@/config/site"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { MainNav } from "@/components/main-nav"
import { ThemeToggle } from "@/components/theme-toggle"

export function SiteHeader() {
  return (
    <header className="bg-background sticky top-0 z-40 w-full border-b">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <MainNav items={siteConfig.mainNav} />
        <div className="flex flex-1 items-center justify-end space-x-3">
          {/* Navbar History button */}
          <Link
            href="/history"
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "h-8.5 gap-1.5 text-xs font-semibold px-3 shadow-2xs hover:bg-muted transition-colors",
            })}
          >
            <History className="h-3.5 w-3.5 text-primary" />
            <span>History</span>
          </Link>

          {/* Quick Scan CTA */}
          <Link
            href="/scan"
            className={buttonVariants({
              variant: "default",
              size: "sm",
              className: "hidden sm:inline-flex h-8.5 gap-1.5 text-xs font-bold px-3 shadow-2xs",
            })}
          >
            <ScanLine className="h-3.5 w-3.5" />
            <span>Scan Food</span>
          </Link>

          <nav className="flex items-center space-x-1 border-l pl-2">
            <Link
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
            >
              <div
                className={buttonVariants({
                  size: "icon",
                  variant: "ghost",
                  className: "h-8.5 w-8.5",
                })}
              >
                <Icons.gitHub className="h-4.5 w-4.5" />
                <span className="sr-only">GitHub</span>
              </div>
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  )
}
