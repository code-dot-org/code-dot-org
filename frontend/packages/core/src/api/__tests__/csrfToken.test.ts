// @vitest-environment jsdom
import {afterEach, describe, expect, it, vi} from 'vitest';

import {
  getSpaCsrfToken,
  refreshCsrfToken,
  resolveCsrfToken,
  setSpaCsrfToken,
} from '../csrfToken';
import type {Transport} from '../transports/types';

// Minimal transport whose requestWithMeta returns the given response headers.
function transportWithHeaders(
  headers: Record<string, string>,
  reject = false,
): Transport {
  return {
    requestWithMeta: reject
      ? vi.fn().mockRejectedValue(new Error('boom'))
      : vi.fn().mockResolvedValue({
          data: undefined,
          meta: {status: 200, headers, url: '/get_token'},
        }),
  } as unknown as Transport;
}

function setMeta(content: string | null) {
  document.querySelector('meta[name="csrf-token"]')?.remove();
  if (content !== null) {
    const meta = document.createElement('meta');
    meta.name = 'csrf-token';
    meta.content = content;
    document.head.appendChild(meta);
  }
}

afterEach(() => {
  setSpaCsrfToken(null);
  setMeta(null);
});

describe('resolveCsrfToken', () => {
  it('is null when neither the meta nor a fetched token is present', () => {
    expect(resolveCsrfToken()).toBeNull();
  });

  it('uses the fetched token when the meta is absent', () => {
    setSpaCsrfToken('fetched-tok');
    expect(getSpaCsrfToken()).toBe('fetched-tok');
    expect(resolveCsrfToken()).toBe('fetched-tok');
  });

  it('uses the shell meta when no token has been fetched', () => {
    setMeta('meta-tok');
    expect(resolveCsrfToken()).toBe('meta-tok');
  });

  it('prefers a fetched token over the shell meta (it is at least as fresh)', () => {
    // A token fetched after a server-side rotation must beat the frozen
    // page-load meta, else the next mutation 422s on a stale token.
    setMeta('stale-meta');
    setSpaCsrfToken('rotated-tok');
    expect(resolveCsrfToken()).toBe('rotated-tok');
  });
});

describe('refreshCsrfToken', () => {
  it('reads the rotated token from the /get_token response header via the transport', async () => {
    setSpaCsrfToken('stale');
    const transport = transportWithHeaders({'csrf-token': 'rotated'});

    await refreshCsrfToken(transport);

    expect(transport.requestWithMeta).toHaveBeenCalledWith({
      method: 'GET',
      url: '/get_token',
    });
    expect(getSpaCsrfToken()).toBe('rotated');
  });

  it('keeps the current token when the request fails', async () => {
    setSpaCsrfToken('keep');

    await refreshCsrfToken(transportWithHeaders({}, true));

    expect(getSpaCsrfToken()).toBe('keep');
  });
});
