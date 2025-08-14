import {NextRequest} from 'next/server';

import {getCachedRedirectResponse} from '@/middleware/utils/getCachedRedirectResponse';

export function getRedirects(request: NextRequest) {
  const pathParts = request.nextUrl.pathname.split('/').filter(Boolean);

  const maybeLocale = pathParts[0];

  // Permanently redirect /es to /es-LA
  // Code may be removed after January 2026 (to allow time for SEO crawlers to update)
  if (maybeLocale === 'es') {
    const restOfPath = pathParts.slice(1).join('/');
    const redirectUrl = new URL(`/es-LA/${restOfPath}`, request.nextUrl.origin);

    return getCachedRedirectResponse(redirectUrl, {status: 308});
  }
}
