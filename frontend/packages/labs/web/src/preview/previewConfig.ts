// Where the preview page is served from. Student HTML/JS runs there, so it must
// be a DIFFERENT ORIGIN from the lab — otherwise the page can reach the lab's
// cookies and session. Legacy gives every project its own subdomain
// (`{channelId}.preview.…codeprojects.org`, served by dashboard's
// codeprojects_preview_controller), which isolates projects from each other too.
//
// This package takes the same approach the pyodide sandbox does: the host names
// the origin, rather than the lab hard-coding a hostname. Set it explicitly with
// `setPreviewBaseUrl`, or pass it on the lab's URL:
//
//   ?web-preview=http://localhost:5201/preview.html
//
// The demo uses ONE preview origin for every project (a second dev server) to
// avoid needing wildcard DNS locally; a real deployment should keep legacy's
// per-project subdomain so projects are isolated from one another as well.

/** Query param naming the preview page URL. */
export const PREVIEW_URL_PARAM = 'web-preview';

/** Query param the lab adds to the preview URL so it knows who to talk to. */
export const PARENT_ORIGIN_PARAM = 'parentOrigin';

let previewBaseUrl: string | null = null;

/** Point the preview at a specific page URL (host-supplied). */
export const setPreviewBaseUrl = (url: string | null) => {
  previewBaseUrl = url;
};

/** Read the preview URL from a `location.search` string; null if unset. */
export function parsePreviewUrl(search: string): string | null {
  const value = new URLSearchParams(search).get(PREVIEW_URL_PARAM);
  return value ? value : null;
}

/**
 * The preview page URL, or null when none is configured — in which case the lab
 * shows a message instead of rendering student code on its own origin.
 */
export function getPreviewUrl(): string | null {
  if (previewBaseUrl) {
    return previewBaseUrl;
  }
  if (typeof window === 'undefined') {
    return null;
  }
  return parsePreviewUrl(window.location.search);
}
