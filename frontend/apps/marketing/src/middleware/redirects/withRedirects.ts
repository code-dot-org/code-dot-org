import {NextFetchEvent, NextRequest, NextResponse} from 'next/server';

import {getBrandFromHostname} from '@/config/brand';
import redirectCacheByBrand from '@/middleware/redirects/cache';

import {MiddlewareFactory} from '../types';

/**
 * This middleware reads Contentful redirects from the in-memory cache and forwards requests as directed in Contentful.
 *
 * See: 'Redirect' content type in Contentful
 */
export const withRedirects: MiddlewareFactory = next => {
  return async (request: NextRequest, event: NextFetchEvent) => {
    const {pathname} = request.nextUrl;

    // See the `/src/app` page parameters
    // For example, `/code.org/en-US/home` -> code.org (the brand)
    // Note: the pathname is guaranteed to have at least 2 segments, due to the withBrand middleware
    const hostname = request.headers.get('host');
    const brand = getBrandFromHostname(hostname);
    const redirectCache = redirectCacheByBrand.get(brand)!;

    if (redirectCache.has(pathname)) {
      const redirectPath = redirectCache.get(pathname)!;

      const url = request.nextUrl.clone();
      url.pathname = redirectPath;

      return NextResponse.redirect(url);
    }

    return next(request, event);
  };
};
