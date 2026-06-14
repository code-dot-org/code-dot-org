// CSRF token resolution for mutating requests.
//
// The Rails-rendered shell injects `<meta name="csrf-token">`, but a hard load
// of an SPA subroute can be served a static shell without it. In that case the
// host primes a token fetched from GET /get_token via setSpaCsrfToken; the meta
// still wins when present.

let spaCsrfToken: string | null = null;

export function setSpaCsrfToken(token: string | null): void {
  spaCsrfToken = token;
}

export function getSpaCsrfToken(): string | null {
  return spaCsrfToken;
}

function metaCsrfToken(): string | null {
  return (
    document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
      ?.content ?? null
  );
}

export function resolveCsrfToken(): string | null {
  return metaCsrfToken() ?? spaCsrfToken;
}
