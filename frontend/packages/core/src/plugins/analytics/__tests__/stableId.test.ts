/**
 * The http development host, which only a cookie without Secure reaches.
 *
 * @vitest-environment jsdom
 * @vitest-environment-options {"url": "http://localhost-studio.code.org:3000/"}
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

vi.mock('../../../index', () => ({
  CodeStudioConfig: {
    environment: 'development',
    dashboardApiUrl: 'http://localhost-studio.code.org:3000',
  },
}));

import {
  COOKIE_NAME,
  fetchStableId,
  forgetStableId,
  isValidStableId,
  persistStableId,
  readStableId,
} from '../stableId';

const COOKIE_SCOPE = 'path=/; domain=.code.org';
const LEGACY_LOCAL_STORAGE_KEY = 'STATSIG_STABLE_ID';
const STABLE_ID = '8f819c93-3aa9-4c2f-9bea-8d32a448f368';

function setCookie(value: string) {
  document.cookie = `${COOKIE_NAME}=${value}; ${COOKIE_SCOPE}`;
}

function stubServer(body: string, status = 200) {
  vi.stubGlobal(
    'fetch',
    vi.fn(
      async () =>
        new Response(body, {status, headers: {'content-type': 'text/plain'}}),
    ),
  );
}

let warn: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  document.cookie = `${COOKIE_NAME}=; ${COOKIE_SCOPE}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  localStorage.clear();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('isValidStableId', () => {
  it('accepts a v4 UUID in either case', () => {
    expect(isValidStableId(STABLE_ID)).toBe(true);
    expect(isValidStableId(STABLE_ID.toUpperCase())).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isValidStableId('not-a-uuid')).toBe(false);
    expect(isValidStableId('')).toBe(false);
    expect(isValidStableId(undefined)).toBe(false);
  });
});

describe('readStableId', () => {
  it('reads a well-formed cookie', () => {
    setCookie(STABLE_ID);

    expect(readStableId()).toBe(STABLE_ID);
  });

  it('treats a malformed cookie as absent', () => {
    setCookie('not-a-uuid');

    expect(readStableId()).toBeUndefined();
  });

  it('treats an undecodable cookie escape as absent', () => {
    setCookie('%E0%A4%A');

    expect(readStableId()).toBeUndefined();
  });

  it('reads a value carrying a stray percent without throwing', () => {
    setCookie('100%');

    expect(() => readStableId()).not.toThrow();
  });
});

describe('persistStableId', () => {
  it('writes a cookie the http development host accepts', () => {
    persistStableId(STABLE_ID);

    expect(document.cookie).toContain(`${COOKIE_NAME}=${STABLE_ID}`);
  });

  it('writes nothing to localStorage', () => {
    persistStableId(STABLE_ID);

    expect(localStorage.getItem(LEGACY_LOCAL_STORAGE_KEY)).toBeNull();
  });
});

describe('forgetStableId', () => {
  it('removes the cookie and the copy earlier versions left in localStorage', () => {
    persistStableId(STABLE_ID);
    localStorage.setItem(LEGACY_LOCAL_STORAGE_KEY, STABLE_ID);

    forgetStableId();

    expect(readStableId()).toBeUndefined();
    expect(localStorage.getItem(LEGACY_LOCAL_STORAGE_KEY)).toBeNull();
  });
});

describe('fetchStableId', () => {
  it('asks the dashboard with a timeout and adopts a well-formed answer', async () => {
    stubServer(STABLE_ID);

    await expect(fetchStableId()).resolves.toBe(STABLE_ID);
    const [request] = vi.mocked(fetch).mock.calls[0] as [Request];
    expect(request.url).toBe(
      'http://localhost-studio.code.org:3000/api/stable_id',
    );
    expect(request.signal).toBeInstanceOf(AbortSignal);
  });

  it('yields nothing for a malformed answer', async () => {
    stubServer('<html>blocked</html>');

    await expect(fetchStableId()).resolves.toBeUndefined();
  });

  it('reports a failed request and yields nothing', async () => {
    stubServer('nope', 500);

    await expect(fetchStableId()).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('failed to fetch the stable ID'),
      expect.any(Error),
    );
  });

  it('reports an unreachable server and yields nothing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('timeout')));

    await expect(fetchStableId()).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('failed to fetch the stable ID'),
      expect.any(Error),
    );
  });
});
