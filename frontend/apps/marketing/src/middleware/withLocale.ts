import Negotiator from 'negotiator';
import {NextFetchEvent, NextRequest} from 'next/server';

import {Brand, getBrandFromHostname} from '@/config/brand';
import {
  getLocalizeJsLocaleFromDashboardLocale,
  getDashboardLocale,
  SUPPORTED_LOCALE_CODES,
  SUPPORTED_LOCALES_SET,
  SupportedLocale,
} from '@/config/locale';
import {getStage} from '@/config/stage';
import {getStudioBaseUrl} from '@/config/studio';
import {getContentfulSlug} from '@/contentful/slug/getContentfulSlug';
import {getCookieNameByStage} from '@/cookies/getCookie';
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

    if (brand === Brand.CODE_DOT_ORG) {
      if (SUPPORTED_LOCALES_SET.has(maybeLocale)) {
        // If the first part of the path is a supported locale or there are no subpaths, we don't need to redirect
        const response = await next(request, event);

        response.cookies.set('language_', getDashboardLocale(maybeLocale), {
          path: '/',
          domain: stage === 'production' ? '.code.org' : undefined,
        });

        return response;
      }

      if (isRootRoute) {
        // If the _user_type cookie is set, then Dashboard successfully logged in the user which is an early indicator
        // that the user is logged in right now. Therefore, send the user to Code Studio
        // See: https://github.com/code-dot-org/code-dot-org/blob/3fad8bce055846378ae3da343da93a32acd4df8c/dashboard/config/initializers/devise.rb#L331
        const userTypeCookie = request.cookies.get(
          getCookieNameByStage('_user_type', stage),
        );

        if (userTypeCookie?.value) {
          return getCachedRedirectResponse(getStudioBaseUrl());
        }
      }
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

    if (brand === Brand.CODE_DOT_ORG) {
      // Set the language cookie if discovered via Accept-Language header
      response.cookies.set('language_', getDashboardLocale(locale), {
        path: '/',
        domain: getStage() === 'production' ? '.code.org' : undefined,
      });
    }

    return response;
  };
};
