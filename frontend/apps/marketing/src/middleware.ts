import {NextRequest, NextResponse} from 'next/server';

import {getBrandFromHostname} from '@/config/brand';

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)',
  ],
};

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
export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // Get hostname of request (e.g. demo.vercel.pub, demo.localhost:3000)
  const hostname = req.headers.get('host');
  const brand = getBrandFromHostname(hostname);

  const searchParams = req.nextUrl.searchParams.toString();
  // Get the pathname of the request (e.g. /, /about, /blog/first-post)
  const path = `${url.pathname}${
    searchParams.length > 0 ? `?${searchParams}` : ''
  }`;

  // rewrite everything else to `/[domain]/[slug] dynamic route
  return NextResponse.rewrite(new URL(`/${brand}${path}`, req.url));
}
