/**
 * Tests for resolveJoinCode.
 *
 * fetch is mocked globally so no network access occurs.  The
 * @code-dot-org/core module is mocked to return no resolveJoinCode export,
 * forcing all tests through the HTTP fallback path.
 */

import {vi, describe, it, expect, beforeEach} from 'vitest';

// ---------------------------------------------------------------------------
// Module mocks — declared before the module under test is imported.
// ---------------------------------------------------------------------------

// Simulate @code-dot-org/core not exporting resolveJoinCode so tests exercise
// the HTTP fallback path deterministically.
vi.mock('@code-dot-org/core', () => ({}));

// ---------------------------------------------------------------------------
// Imports after mocks
// ---------------------------------------------------------------------------

import {resolveJoinCode, JoinCodeError} from '../joinCode';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Creates a mock Response for a successful redirect resolution.
 *
 * @param finalUrl - The URL that represents the final destination after redirects.
 * @returns Partial Response mock with ok=true and the given url.
 */
function mockSuccessResponse(finalUrl: string): Response {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    url: finalUrl,
  } as unknown as Response;
}

/**
 * Creates a mock Response for a failed HTTP lookup.
 *
 * @param status - HTTP error status code.
 * @returns Partial Response mock with ok=false.
 */
function mockErrorResponse(status: number): Response {
  return {
    ok: false,
    status,
    statusText: 'Not Found',
    url: '',
  } as unknown as Response;
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Format validation
// ---------------------------------------------------------------------------

describe('resolveJoinCode — invalid format', () => {
  it('throws JoinCodeError("invalid-format") for a code that is too short', async () => {
    await expect(resolveJoinCode('AB')).rejects.toSatisfy(
      (err: unknown) => err instanceof JoinCodeError && err.reason === 'invalid-format'
    );
  });

  it('throws JoinCodeError("invalid-format") for a code that is too long', async () => {
    await expect(resolveJoinCode('ABCDEFG')).rejects.toSatisfy(
      (err: unknown) => err instanceof JoinCodeError && err.reason === 'invalid-format'
    );
  });

  it('throws JoinCodeError("invalid-format") for a code with special characters', async () => {
    await expect(resolveJoinCode('AB-CD')).rejects.toSatisfy(
      (err: unknown) => err instanceof JoinCodeError && err.reason === 'invalid-format'
    );
  });

  it('does not make a network call for an invalid format', async () => {
    const mockFetch = vi.fn();
    globalThis.fetch = mockFetch;

    await expect(resolveJoinCode('X')).rejects.toBeInstanceOf(JoinCodeError);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Successful resolution
// ---------------------------------------------------------------------------

describe('resolveJoinCode — successful resolution', () => {
  it('returns the resolved URL from a mocked 200 response', async () => {
    const expectedUrl = 'https://raw.githubusercontent.com/owner/repo/main/nb.ipynb';
    globalThis.fetch = vi.fn().mockResolvedValue(mockSuccessResponse(expectedUrl));

    const result = await resolveJoinCode('NB7K');

    expect(result).toBe(expectedUrl);
  });

  it('uppercases a lowercase code before sending the request', async () => {
    const expectedUrl = 'https://raw.githubusercontent.com/owner/repo/main/nb.ipynb';
    globalThis.fetch = vi.fn().mockResolvedValue(mockSuccessResponse(expectedUrl));

    await resolveJoinCode('nb7k');

    expect(vi.mocked(globalThis.fetch)).toHaveBeenCalledWith(
      'https://code.org/go/NB7K',
      expect.objectContaining({redirect: 'follow'})
    );
  });
});

// ---------------------------------------------------------------------------
// HTTP error handling
// ---------------------------------------------------------------------------

describe('resolveJoinCode — HTTP errors', () => {
  it('throws JoinCodeError("not-found") on a 404 response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(mockErrorResponse(404));

    await expect(resolveJoinCode('ABCD')).rejects.toSatisfy(
      (err: unknown) => err instanceof JoinCodeError && err.reason === 'not-found'
    );
  });

  it('throws JoinCodeError("not-found") on a non-2xx response other than network error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(mockErrorResponse(500));

    await expect(resolveJoinCode('XYZAB')).rejects.toSatisfy(
      (err: unknown) => err instanceof JoinCodeError && err.reason === 'not-found'
    );
  });
});

// ---------------------------------------------------------------------------
// Network error handling
// ---------------------------------------------------------------------------

describe('resolveJoinCode — network error', () => {
  it('throws JoinCodeError("network") when fetch rejects', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(resolveJoinCode('ABCD')).rejects.toSatisfy(
      (err: unknown) => err instanceof JoinCodeError && err.reason === 'network'
    );
  });
});
