/**
 * unitName — derives a human-readable unit name from a folder path string.
 *
 * Strips the directory prefix, replaces hyphens with spaces, and title-cases
 * each word.  An empty input falls back to "More Notebooks" so the catch-all
 * group always has a legible label.
 */

/** Fallback label used when the folder path is empty or contains no segment. */
const FALLBACK_UNIT_NAME = 'More Notebooks';

/**
 * Title-cases a single word: first character upper, rest lower.
 *
 * @param word - The word to transform.
 * @returns The word with its first character uppercased.
 */
function titleCaseWord(word: string): string {
  if (word.length === 0) {
    return word;
  }
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

/**
 * Derives a human-readable unit name from a filesystem-style folder path.
 *
 * Takes the last path segment (after the final `/`), replaces hyphens with
 * spaces, and title-cases each word.  Returns {@link FALLBACK_UNIT_NAME} when
 * the path is empty or the last segment resolves to an empty string.
 *
 * @param folder - Folder path string, e.g. `'/lessons/unit-2-variables'`.
 * @returns Human-readable unit name, e.g. `'Unit 2 Variables'`.
 */
export function unitName(folder: string): string {
  const lastSegment = folder.split('/').pop() ?? '';

  if (lastSegment.length === 0) {
    return FALLBACK_UNIT_NAME;
  }

  return lastSegment.split('-').map(titleCaseWord).join(' ');
}
