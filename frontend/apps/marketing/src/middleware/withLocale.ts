import Negotiator from 'negotiator';
import {NextFetchEvent, NextRequest, NextResponse} from 'next/server';

import {
  getLocalizeJsLocale,
  getPegasusLocale,
  SUPPORTED_LOCALE_CODES,
  SUPPORTED_LOCALES_SET,
} from '@/config/locale';
import {getStage} from '@/config/stage';
import {getContentfulSlug} from '@/contentful/slug/getContentfulSlug';

import {MiddlewareFactory} from './types';

function getLanguageFromCookie(request: NextRequest) {
  const cookieLocale = getLocalizeJsLocale(
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

    const maybeLocale = pathParts[0];

    if (SUPPORTED_LOCALES_SET.has(maybeLocale)) {
      // If the first part of the path is a supported locale or there are no subpaths, we don't need to redirect
      const response = await next(request, event);

      response.cookies.set('language_', getPegasusLocale(maybeLocale), {
        path: '/',
        domain: getStage() === 'production' ? '.code.org' : undefined,
      });

      return response;
    }

    // If pathParts is empty, then it is a request to / which should resolve to the /home slug
    const slug = pathParts.length === 0 ? 'home' : getContentfulSlug(pathParts);

    const cookieLocale = getLanguageFromCookie(request);
    const browserPreferredLocale = getLanguageFromAcceptLanguageHeader(request);

    /**
     * Sets the locale in the following order of preferences:
     * 1. Cookie `language_` (if set and valid)
     * 2. Accept-Language header (if set and valid)
     * 3. Default to 'en-US'
     */
    const locale = cookieLocale || browserPreferredLocale || 'en-US';

    const redirectUrl = new URL(`/${locale}/${slug}`, request.url);
    const response = NextResponse.redirect(redirectUrl);

    // Set the language cookie if discovered via Accept-Language header
    response.cookies.set('language_', getPegasusLocale(locale), {
      path: '/',
      domain: getStage() === 'production' ? '.code.org' : undefined,
    });

    return response;
  };
};
