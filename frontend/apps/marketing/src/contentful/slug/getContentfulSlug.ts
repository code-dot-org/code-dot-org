/**
 * Joins all page paths into a single string with slashes.
 * For example, ['engineering', 'all-the-things'] becomes 'engineering/all-the-things'.
 * @param pagePaths An array of page paths or a single page path string.
 */
export function getContentfulSlug(pagePaths: string | string[]): string {
  if (Array.isArray(pagePaths)) {
    return pagePaths.join('/');
  }

  return pagePaths;
}
