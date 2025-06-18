import {draftMode} from 'next/headers';
import {NextRequest, NextResponse} from 'next/server';

import {getBrandFromHostname} from '@/config/brand';
import {PREVIEW_HOSTNAMES} from '@/config/preview';

import {MiddlewareFactory} from './types';

/**
 * This middleware detects the brand via the hostname of the request and injects it into the top level [brand]
 * param to enable multi-tenancy in this application.
 *
 * See: https://github.com/vercel/platforms
 *
 * This effectively routes requests as such:
 *
 * localhost.code.org:3001/en-US/home -> /localhost.code.org:3001/en-US/home
 */
export const withBrand: MiddlewareFactory = () => {
  return async (request: NextRequest) => {
    const url = request.nextUrl;

    // Get hostname of request (e.g. test.code.org, code.org, localhost.code.org:3001)
    const hostname = request.headers.get('host');
    const brand = getBrandFromHostname(hostname);
    const isPreviewHostname = PREVIEW_HOSTNAMES.has(hostname);

    if (isPreviewHostname) {
      const draft = await draftMode();
      draft.enable();
    }

    const searchParams = request.nextUrl.searchParams.toString();
    // Get the pathname of the request.est (e.g. /, /about, /blog/first-post)
    const path = `${url.pathname}${
      searchParams.length > 0 ? `?${searchParams}` : ''
    }`;

    // rewrite everything else to `/[domain]/[slug] dynamic route
    return NextResponse.rewrite(new URL(`/${brand}${path}`, request.url));
  };
};
