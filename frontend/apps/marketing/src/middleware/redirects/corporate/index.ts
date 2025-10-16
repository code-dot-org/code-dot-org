import {NextRequest} from 'next/server';

import {getStudioBaseUrl} from '@/config/studio';
import {getCachedRedirectResponse} from '@/middleware/utils/getCachedRedirectResponse';

export function getRedirects(request: NextRequest) {
  const fullPath = request.nextUrl.pathname;
  const pathParts = fullPath.split('/').filter(Boolean);

  const maybeLocale = pathParts[0];

  // Permanently redirect /es-LA to /es
  // Code may be removed after January 2026 (to allow time for SEO crawlers to update)
  if (maybeLocale === 'es-LA') {
    const restOfPath = pathParts.slice(1).join('/');
    const redirectUrl = new URL(`/es/${restOfPath}`, request.nextUrl.origin);

    return getCachedRedirectResponse(redirectUrl, {status: 308});
  }

  // Permanently redirect /zh-TW to /zh-Hant
  // Code may be removed after January 2026 (to allow time for SEO crawlers to update)
  if (maybeLocale === 'zh-TW') {
    const restOfPath = pathParts.slice(1).join('/');
    const redirectUrl = new URL(
      `/zh-Hant/${restOfPath}`,
      request.nextUrl.origin,
    );

    return getCachedRedirectResponse(redirectUrl, {status: 308});
  }

  // Permanently redirect /applab/docs/:slug to studio.code.org/docs/applab/:slug
  if (pathParts[0] === 'applab' && pathParts[1] === 'docs') {
    const restOfPath = pathParts.slice(2).join('/');
    const redirectUrl = new URL(
      `/docs/applab/${restOfPath}`,
      getStudioBaseUrl(),
    );

    return getCachedRedirectResponse(redirectUrl, {status: 308});
  }

  // Permanently redirect /educate/* to studio.code.org/catalog
  if (pathParts[0] === 'educate') {
    const redirectUrl = new URL(`/catalog`, getStudioBaseUrl());

    return getCachedRedirectResponse(redirectUrl, {status: 308});
  }
}
