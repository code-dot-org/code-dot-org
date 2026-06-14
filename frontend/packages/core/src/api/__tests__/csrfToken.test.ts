// @vitest-environment jsdom
import {afterEach, describe, expect, it, vi} from 'vitest';

import {
  getSpaCsrfToken,
  refreshCsrfToken,
  resolveCsrfToken,
  setSpaCsrfToken,
} from '../csrfToken';

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
  it('fetches /get_token and stores the rotated token', async () => {
    setSpaCsrfToken('stale');
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(null, {status: 200, headers: {'csrf-token': 'rotated'}}),
      );
    vi.stubGlobal('fetch', fetchMock);

    await refreshCsrfToken();

    expect(fetchMock).toHaveBeenCalledWith('/get_token', {
      credentials: 'same-origin',
    });
    expect(getSpaCsrfToken()).toBe('rotated');
    vi.unstubAllGlobals();
  });

  it('keeps the current token when the fetch fails', async () => {
    setSpaCsrfToken('keep');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));

    await refreshCsrfToken();

    expect(getSpaCsrfToken()).toBe('keep');
    vi.unstubAllGlobals();
  });
});
