import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/api", "/onboarding", "/settings"],
    },
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://finanzapp.com"}/sitemap.xml`,
  };
}
