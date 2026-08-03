// Type declarations for the plain-JS backdrop naming rules, so TypeScript
// callers (the sync test) can import them without an implicit-any error.

export function backgroundUrls(text: string): string[];
export function backgroundFileName(url: string): string;
