import {NextResponse} from 'next/server';

import {STALE_WHILE_REVALIDATE_ONE_HOUR} from '@/cache/constants';

/**
 * Sets the Cache-Control header on a redirect response to cache the redirect on the CDN.
 * @param url The URL to redirect to.
 * @param init Optional ResponseInit to customize the response.
 */
export function getCachedRedirectResponse(
  url: string | URL,
  init?: ResponseInit,
): NextResponse {
  const response = NextResponse.redirect(url, init);

  // Cache the redirect on Cloudfront
  response.headers.set('Cache-Control', STALE_WHILE_REVALIDATE_ONE_HOUR);

  return response;
}
