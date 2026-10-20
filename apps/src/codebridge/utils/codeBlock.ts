/** Wraps text in a markdown code fence for a model; empty text stays empty. */
export function codeBlock(str?: string): string {
  if (!str) return '';
  return `\`\`\`\n${str}\n\`\`\``;
}
