/**
 * Pure functions building share-intent URLs for the major platforms.
 * Kept separate from the React component so they can be unit-tested without
 * importing client-only modules.
 */
export type SharePlatform = "x" | "linkedin" | "whatsapp";

export function buildShareUrl(platform: SharePlatform, url: string, title: string): string {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  switch (platform) {
    case "x":
      return `https://twitter.com/intent/tweet?url=${u}&text=${t}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
    case "whatsapp":
      return `https://api.whatsapp.com/send?text=${t}%20${u}`;
  }
}
