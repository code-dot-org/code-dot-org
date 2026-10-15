import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {primeCsrfToken} from '../primeCsrfToken';

const getSpaCsrfToken = vi.fn();
const setSpaCsrfToken = vi.fn();

vi.mock('@code-dot-org/core/api', () => ({
  getSpaCsrfToken: () => getSpaCsrfToken(),
  setSpaCsrfToken: (t: string | null) => setSpaCsrfToken(t),
}));

function setMeta(present: boolean) {
  document.querySelector('meta[name="csrf-token"]')?.remove();
  if (present) {
    const meta = document.createElement('meta');
    meta.name = 'csrf-token';
    meta.content = 'meta-tok';
    document.head.appendChild(meta);
  }
}

// GET /get_token returns an empty body with the token in the csrf-token header.
function mockFetch(token: string | null) {
  return vi.fn().mockResolvedValue(
    new Response(null, {
      headers: token === null ? {} : {'csrf-token': token},
    }),
  );
}

beforeEach(() => {
  getSpaCsrfToken.mockReset().mockReturnValue(null);
  setSpaCsrfToken.mockReset();
});
afterEach(() => {
  setMeta(false);
  vi.unstubAllGlobals();
});

describe('primeCsrfToken', () => {
  it('does nothing when the shell already rendered the csrf meta', async () => {
    setMeta(true);
    const fetchMock = mockFetch('hdr-tok');
    vi.stubGlobal('fetch', fetchMock);
    await primeCsrfToken();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(setSpaCsrfToken).not.toHaveBeenCalled();
  });

  it('reads the token from the csrf-token response header and stores it', async () => {
    setMeta(false);
    const fetchMock = mockFetch('hdr-tok');
    vi.stubGlobal('fetch', fetchMock);
    await primeCsrfToken();
    expect(fetchMock).toHaveBeenCalledWith(
      '/get_token',
      expect.objectContaining({credentials: 'same-origin'}),
    );
    expect(setSpaCsrfToken).toHaveBeenCalledWith('hdr-tok');
  });

  it('is idempotent — skips the fetch when a token is already primed', async () => {
    setMeta(false);
    getSpaCsrfToken.mockReturnValue('already');
    const fetchMock = mockFetch('hdr-tok');
    vi.stubGlobal('fetch', fetchMock);
    await primeCsrfToken();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('stores nothing when the response carries no token header', async () => {
    setMeta(false);
    vi.stubGlobal('fetch', mockFetch(null));
    await primeCsrfToken();
    expect(setSpaCsrfToken).not.toHaveBeenCalled();
  });

  it('swallows a fetch failure without storing a token', async () => {
    setMeta(false);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));
    await expect(primeCsrfToken()).resolves.toBeUndefined();
    expect(setSpaCsrfToken).not.toHaveBeenCalled();
  });
});
