/** `camelCase`/`name` → a human "Title Case" dropdown label. */
export const label = (name: string): string =>
  name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, c => c.toUpperCase())
    .trim();
