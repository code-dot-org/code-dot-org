import {NextResponse} from 'next/server';

/**
 * Sets the Cache-Control header on a redirect response to cache the redirect on the CDN.
 * @param url The URL to redirect to.
 */
export function getCachedRedirectResponse(url: string | URL) {
  const response = NextResponse.redirect(url);

  // Cache the redirect on Cloudfront
  response.headers.set(
    'Cache-Control',
    's-maxage=3600, stale-while-revalidate=31535100',
  );

  return response;
}
