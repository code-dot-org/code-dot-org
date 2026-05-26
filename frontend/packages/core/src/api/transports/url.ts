import type {RequestOptions} from './types';

export function buildUrl(
  baseUrl: string | undefined,
  req: RequestOptions,
): string {
  const raw = req.url.startsWith('http')
    ? req.url
    : joinUrl(baseUrl ?? '', req.url);

  const u = new URL(
    raw,
    raw.startsWith('http') ? undefined : window.location.origin,
  );

  if (req.query) {
    for (const [k, v] of Object.entries(req.query)) {
      if (v === undefined || v === null) continue;
      u.searchParams.set(k, String(v));
    }
  }
  return u.toString();
}

function joinUrl(base: string, path: string): string {
  if (!base) return path;
  const b = base.endsWith('/') ? base.slice(0, -1) : base;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}

/** Stable key for replay caches. */
export function toReplayKey(req: RequestOptions): string {
  const query = req.query
    ? Object.entries(req.query)
        .filter(([, v]) => v !== undefined && v !== null)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
        .join('&')
    : '';

  // Body only matters for non-GET requests (usually).
  const bodyPart =
    req.method === 'GET' || req.body === undefined
      ? ''
      : `|body=${stableStringify(req.body)}`;

  return `${req.method} ${req.url}${query ? `?${query}` : ''}${bodyPart}`;
}

function stableStringify(x: unknown): string {
  // good-enough deterministic stringify for replay keys
  return JSON.stringify(x, (_k, v) => {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      return Object.fromEntries(
        Object.entries(v as Record<string, unknown>).sort(([a], [b]) =>
          a.localeCompare(b),
        ),
      );
    }
    return v;
  });
}
