/**
 * The bundle at `moduleUrl`, under a URL a check run has to itself.
 *
 * The browser keeps one module per URL, and the build worker serves by path
 * alone (`worldBuildServiceWorker`), so this loads the same bundle afresh.
 */
export function checkModuleUrl(moduleUrl: string, id: string): string {
  const url = new URL(moduleUrl);
  url.searchParams.set('check', id);
  return url.toString();
}
