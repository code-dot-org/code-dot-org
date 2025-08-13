import {NextFetchEvent, NextRequest, NextResponse} from 'next/server';

import {STALE_WHILE_REVALIDATE_ONE_HOUR} from '@/cache/constants';
import {RedirectEntryResponse} from '@/cache/redirects/types';
import {getBrandFromHostname} from '@/config/brand';
import {getLocalhostAddress} from '@/config/host';
import {getBrandRedirects} from '@/middleware/redirects';

import {MiddlewareFactory} from './types';

/**
 * This middleware reads Contentful redirects from the redirect config API endpoint and forwards requests as directed in Contentful.
 *
 * See: 'Redirect' content type in Contentful
 */
export const withRedirects: MiddlewareFactory = next => {
  return async (request: NextRequest, event: NextFetchEvent) => {
    const {pathname} = request.nextUrl;

    const hostname = request.headers.get('host');
    const brand = getBrandFromHostname(hostname);

    const brandRedirects = getBrandRedirects(brand, request);

    if (brandRedirects) {
      return brandRedirects;
    }

    const redirectConfigUrl = new URL(
      `${getLocalhostAddress()}/api/private/redirects/${encodeURIComponent(brand)}/${encodeURIComponent(pathname)}`,
    );

    const redirectCacheByBrandResponse = await fetch(redirectConfigUrl, {
      method: 'GET',
    });

    const redirectEntryResponse: RedirectEntryResponse =
      await redirectCacheByBrandResponse.json();

    if (!redirectEntryResponse.redirectEntry) {
      return next(request, event);
    }

    const redirectEntry = redirectEntryResponse.redirectEntry;

    const redirectUrl = redirectEntry.destination.startsWith('/')
      ? `${request.nextUrl.origin}${redirectEntry.destination}`
      : redirectEntry.destination;

    if (redirectEntry) {
      const responseHeaders: HeadersInit = {
        'Cache-Control': STALE_WHILE_REVALIDATE_ONE_HOUR,
      };

      const etagValue = redirectCacheByBrandResponse.headers.get('ETag');
      if (etagValue) {
        responseHeaders['ETag'] = etagValue;
      }

      return NextResponse.redirect(redirectUrl, {
        status: redirectEntry.permanent ? 308 : 307,
        headers: responseHeaders,
      });
    }

    return next(request, event);
  };
};
