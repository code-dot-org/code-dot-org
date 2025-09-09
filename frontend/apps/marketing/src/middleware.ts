import {chainMiddleware} from '@/middleware/chainMiddleware';
import {withBrand} from '@/middleware/withBrand';
import {withLocale} from '@/middleware/withLocale';
import {withRedirects} from '@/middleware/withRedirects';

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. /onetrust (OneTrust cookie consent)
     * 4. all root files inside /public (e.g. /favicon.ico)
     * 5. /robots.txt
     */
    '/((?!api/|_next/|onetrust/|_static/|_vercel|robots.txt|sitemap.xml).*)',
  ],
};

export default chainMiddleware([withRedirects, withLocale, withBrand]);
