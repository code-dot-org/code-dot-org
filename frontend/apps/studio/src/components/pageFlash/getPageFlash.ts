export interface PageFlashMessage {
  type: 'notice' | 'info' | 'alert';
  message: string;
}

const PAGE_FLASH_TYPES = new Set(['notice', 'info', 'alert']);

function isPageFlashMessage(entry: unknown): entry is PageFlashMessage {
  if (typeof entry !== 'object' || entry === null) return false;
  const {type, message} = entry as Record<string, unknown>;
  return (
    typeof type === 'string' &&
    PAGE_FLASH_TYPES.has(type) &&
    typeof message === 'string'
  );
}

/**
 * Parse the <meta name="page-flash"> tag the Rails shell stamps with the
 * request's session flash. Absent or malformed content yields an empty list,
 * which is the standalone (no Rails) case; invalid entries are dropped.
 */
function parsePageFlash(): PageFlashMessage[] {
  try {
    const meta = document.querySelector<HTMLMetaElement>(
      'meta[name="page-flash"]',
    );
    if (!meta?.content) return [];
    const entries: unknown = JSON.parse(meta.content);
    return Array.isArray(entries) ? entries.filter(isPageFlashMessage) : [];
  } catch {
    return [];
  }
}

let pageFlash: PageFlashMessage[] | undefined;

/** The flash messages the shell carried for this page load, read once. */
export function getPageFlash(): PageFlashMessage[] {
  pageFlash ??= parsePageFlash();
  return pageFlash;
}
