import {NextResponse} from 'next/server';

import {STALE_WHILE_REVALIDATE_ONE_HOUR} from '@/cache/constants';

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

    expect(NextResponse.redirect).toHaveBeenCalledWith(url, undefined);
    expect(response.headers.set).toHaveBeenCalledWith(
      'Cache-Control',
      STALE_WHILE_REVALIDATE_ONE_HOUR,
    );
  });

  it('should handle URL objects correctly', () => {
    const url = new URL('https://code.marketing-sites.localhost');
    const response = getCachedRedirectResponse(url);

    expect(NextResponse.redirect).toHaveBeenCalledWith(url, undefined);
    expect(response.headers.set).toHaveBeenCalledWith(
      'Cache-Control',
      STALE_WHILE_REVALIDATE_ONE_HOUR,
    );
  });

  it('should return a response object', () => {
    const url = 'https://code.marketing-sites.localhost';
    const response = getCachedRedirectResponse(url, undefined);

    expect(response).toBeDefined();
    expect(typeof response).toBe('object');
  });

  it('should pass the init status code to NextResponse.redirect', () => {
    const url = 'https://code.marketing-sites.localhost';
    const init = {status: 301};
    getCachedRedirectResponse(url, init);
    expect(NextResponse.redirect).toHaveBeenCalledWith(url, init);
  });
});
