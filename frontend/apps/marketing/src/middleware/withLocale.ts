import Negotiator from 'negotiator';
import {NextFetchEvent, NextRequest} from 'next/server';

import {getBrandFromHostname} from '@/config/brand';
import {
  getLocalizeJsLocaleFromDashboardLocale,
  SUPPORTED_LOCALE_CODES,
  SUPPORTED_LOCALES_SET,
  SupportedLocale,
} from '@/config/locale';
import {getStage} from '@/config/stage';
import {getContentfulSlug} from '@/contentful/slug/getContentfulSlug';
import {setLanguageCookie} from '@/middleware/i18n/setLanguageCookie';
import {getCachedRedirectResponse} from '@/middleware/utils/getCachedRedirectResponse';

import {MiddlewareFactory} from './types';

function getLanguageFromCookie(request: NextRequest) {
  const cookieLocale = getLocalizeJsLocaleFromDashboardLocale(
    request.cookies.get('language_')?.value,
  );
  return cookieLocale !== undefined && SUPPORTED_LOCALES_SET.has(cookieLocale)
    ? cookieLocale
    : undefined;
}

function getLanguageFromAcceptLanguageHeader(request: Request) {
  const acceptLanguageHeader = request.headers.get('accept-language');

  if (!acceptLanguageHeader) {
    return undefined;
  }

  return new Negotiator({
    headers: {'accept-language': acceptLanguageHeader},
  }).language(SUPPORTED_LOCALE_CODES);
}

/**
 * This middleware redirects pages without a locale path to one with a locale path by reading the `language_` cookie.
 *
 * This effectively routes requests as such:
 *
 * /home -> /zh-CN/home
 * /engineering/all-the-things -> /zh-CN/engineering/all-the-things
 */
export const withLocale: MiddlewareFactory = next => {
  return async (request: NextRequest, event: NextFetchEvent) => {
    const {pathname} = request.nextUrl;
    const pathParts = pathname.split('/').filter(Boolean);

    const maybeLocale = pathParts[0] as SupportedLocale;
    const stage = getStage();
    const hostname = request.headers.get('host');
    const brand = getBrandFromHostname(hostname);

    // If pathParts is empty, then it is a request to / which should resolve to the / slug
    // It is an empty string here because when a call is made to Contentful, `/` is automatically prepended
    const isRootRoute = pathParts.length === 0;

    if (SUPPORTED_LOCALES_SET.has(maybeLocale)) {
      // If the first part of the path is a supported locale or there are no subpaths, we don't need to redirect
      const response = await next(request, event);

      setLanguageCookie({response, maybeLocale, stage, brand, hostname});

      return response;
    }

    const slug = isRootRoute ? '' : getContentfulSlug(pathParts);

    const cookieLocale = getLanguageFromCookie(request);
    const browserPreferredLocale = getLanguageFromAcceptLanguageHeader(request);

    /**
     * Sets the locale in the following order of preferences:
     * 1. Cookie `language_` (if set and valid)
     * 2. Accept-Language header (if set and valid)
     * 3. Default to 'en-US'
     */
    const locale = cookieLocale || browserPreferredLocale || 'en-US';

    const localizedPath = isRootRoute ? `/${locale}` : `/${locale}/${slug}`;
    const redirectUrl = new URL(localizedPath, request.url);
    const response = getCachedRedirectResponse(redirectUrl);

    // Set the language cookie if discovered via Accept-Language header
    setLanguageCookie({
      response,
      maybeLocale: locale as SupportedLocale,
      stage,
      brand,
      hostname,
    });

    return response;
  };
};
