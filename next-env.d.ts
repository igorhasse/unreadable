/**
 * Ambient type declarations for Next.js API surface that vinext implements.
 *
 * Vinext shims next/* subpaths via tsconfig paths, but the bare `next`
 * module root and individual font names from `next/font/google` aren't
 * reachable through path mapping. These declarations bridge that gap so
 * Server Components can use standard Next.js import syntax.
 */

declare module "next" {
  export type { Metadata, Viewport } from "vinext/shims/metadata";
}

declare module "next/font/google" {
  import type { FontOptions, FontResult } from "vinext/shims/font-google-base";
  export type { FontOptions, FontResult };
  type FontLoader = (options?: FontOptions) => FontResult;
  const googleFonts: Record<string, FontLoader>;
  export default googleFonts;
  // Fonts used in this project — add more as needed.
  export const Newsreader: FontLoader;
  export const Geist: FontLoader;
  export const JetBrains_Mono: FontLoader;
}

declare module "next/server" {
  export type { NextRequest } from "vinext/shims/server";
  export { NextResponse } from "vinext/shims/server";
}

declare module "next" {
  export namespace MetadataRoute {
    type Sitemap = Array<{
      url: string;
      lastModified?: string | Date;
      changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
      priority?: number;
      alternates?: { languages?: Record<string, string> };
    }>;
    type Robots = {
      rules:
        | { userAgent?: string | string[]; allow?: string | string[]; disallow?: string | string[]; crawlDelay?: number }
        | Array<{ userAgent?: string | string[]; allow?: string | string[]; disallow?: string | string[]; crawlDelay?: number }>;
      sitemap?: string | string[];
      host?: string;
    };
  }
}

declare module "next/og" {
  export class ImageResponse extends Response {
    constructor(element: React.ReactElement, options?: { width?: number; height?: number }): ImageResponse;
  }
}
