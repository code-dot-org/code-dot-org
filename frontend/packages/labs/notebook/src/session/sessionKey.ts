/**
 * Composite key helpers for IndexedDB entries keyed by both session and
 * notebook.  The separator '::' is chosen because UUIDv4 characters are
 * hex digits and hyphens only, making the pair unambiguous.
 */

/**
 * Builds the composite IndexedDB key from session and notebook ids.
 * @param sessionId UUIDv4 session identifier
 * @param notebookId UUIDv4 notebook identifier
 * @returns "${sessionId}::${notebookId}"
 */
export function makeKey(sessionId: string, notebookId: string): string {
  return `${sessionId}::${notebookId}`;
}

/**
 * Parses a composite key back to its components.
 * @param key Composite key in the form "${sessionId}::${notebookId}"
 * @returns Parsed ids, or null if the format is wrong
 */
export function parseKey(
  key: string
): { sessionId: string; notebookId: string } | null {
  const idx = key.indexOf('::');
  if (idx === -1) return null;
  return { sessionId: key.slice(0, idx), notebookId: key.slice(idx + 2) };
}
