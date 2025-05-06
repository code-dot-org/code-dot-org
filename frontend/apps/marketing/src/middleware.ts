import {chainMiddleware} from '@/middleware/chainMiddleware';
import {withBrand} from '@/middleware/withBrand';
import {withLocale} from '@/middleware/withLocale';

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

export default chainMiddleware([withLocale, withBrand]);
