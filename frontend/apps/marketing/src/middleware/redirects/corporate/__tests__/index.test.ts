import {NextRequest} from 'next/server';

import {getCachedRedirectResponse} from '@/middleware/utils/getCachedRedirectResponse';

import {getRedirects} from '../index';

jest.mock('@/config/studio', () => ({
  getStudioBaseUrl: jest.fn(() => 'https://studio.code.org'),
}));
jest.mock('@/middleware/utils/getCachedRedirectResponse', () => ({
  getCachedRedirectResponse: jest.fn((url, opts) => ({
    url: url.toString(),
    status: opts.status,
  })),
}));

function createMockRequest(pathname: string, origin = 'https://example.com') {
  return {
    nextUrl: {
      pathname,
      origin,
    },
  } as unknown as NextRequest;
}

describe('getRedirects', () => {
  afterEach(() => jest.clearAllMocks());

  it('redirects /es to /es-LA', () => {
    const req = createMockRequest('/es');
    getRedirects(req);
    expect(getCachedRedirectResponse).toHaveBeenCalledWith(
      new URL('/es-LA/', req.nextUrl.origin),
      {status: 308},
    );
  });

  it('redirects /es/foo/bar to /es-LA/foo/bar', () => {
    const req = createMockRequest('/es/foo/bar');
    getRedirects(req);
    expect(getCachedRedirectResponse).toHaveBeenCalledWith(
      new URL('/es-LA/foo/bar', req.nextUrl.origin),
      {status: 308},
    );
  });

  it('redirects /applab/docs/abc to studio.code.org/docs/applab/abc', () => {
    const req = createMockRequest('/applab/docs/abc');
    getRedirects(req);
    expect(getCachedRedirectResponse).toHaveBeenCalledWith(
      new URL('/docs/applab/abc', 'https://studio.code.org'),
      {status: 308},
    );
  });

  it('redirects /educate/foo to studio.code.org/catalog', () => {
    const req = createMockRequest('/educate/foo');
    getRedirects(req);
    expect(getCachedRedirectResponse).toHaveBeenCalledWith(
      new URL('/catalog', 'https://studio.code.org'),
      {status: 308},
    );
  });

  it('returns undefined for unrelated paths', () => {
    const req = createMockRequest('/other/path');
    const result = getRedirects(req);
    expect(result).toBeUndefined();
    expect(getCachedRedirectResponse).not.toHaveBeenCalled();
  });
});
