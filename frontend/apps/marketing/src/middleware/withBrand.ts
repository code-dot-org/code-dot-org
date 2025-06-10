import {NextRequest, NextResponse} from 'next/server';

import {getBrandFromHostname} from '@/config/brand';

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

    // Get hostname of request.est (e.g. demo.vercel.pub, demo.localhost:3000)
    const hostname = request.headers.get('host');
    const brand = getBrandFromHostname(hostname);

    const searchParams = request.nextUrl.searchParams.toString();
    // Get the pathname of the request.est (e.g. /, /about, /blog/first-post)
    const path = `${url.pathname}${
      searchParams.length > 0 ? `?${searchParams}` : ''
    }`;

    // rewrite everything else to `/[domain]/[slug] dynamic route
    return NextResponse.rewrite(new URL(`/${brand}${path}`, request.url));
  };
};
