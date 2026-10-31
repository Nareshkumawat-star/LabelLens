export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "LabelLens",
  description:
    "AI-powered food label scanner and nutrition intelligence analyzer.",
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Scan Label",
      href: "/scan",
    },
    {
      title: "History",
      href: "/history",
    },
  ],
  links: {
    github: "https://github.com/nareshkmt112006/labellens",
    twitter: "https://twitter.com",
    docs: "/",
  },
}
