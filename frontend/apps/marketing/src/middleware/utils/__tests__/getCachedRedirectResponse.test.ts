import {NextResponse} from 'next/server';

import {getCachedRedirectResponse} from '../getCachedRedirectResponse';

jest.mock('next/server', () => ({
  NextResponse: {
    redirect: jest.fn(() => ({
      headers: {
        set: jest.fn(),
      },
    })),
  },
}));

describe('getCachedRedirectResponse', () => {
  it('should create a redirect response with the correct URL', () => {
    const url = 'https://code.marketing-sites.localhost';
    const response = getCachedRedirectResponse(url);

    expect(NextResponse.redirect).toHaveBeenCalledWith(url);
    expect(response.headers.set).toHaveBeenCalledWith(
      'Cache-Control',
      's-maxage=3600, stale-while-revalidate=31535100',
    );
  });

  it('should handle URL objects correctly', () => {
    const url = new URL('https://code.marketing-sites.localhost');
    const response = getCachedRedirectResponse(url);

    expect(NextResponse.redirect).toHaveBeenCalledWith(url);
    expect(response.headers.set).toHaveBeenCalledWith(
      'Cache-Control',
      's-maxage=3600, stale-while-revalidate=31535100',
    );
  });

  it('should return a response object', () => {
    const url = 'https://code.marketing-sites.localhost';
    const response = getCachedRedirectResponse(url);

    expect(response).toBeDefined();
    expect(typeof response).toBe('object');
  });
});
