import {NextFetchEvent, NextRequest, NextResponse} from 'next/server';

import {SUPPORTED_LOCALES} from '@/config/locale';

import {MiddlewareFactory} from './types';

/**
 * This middleware redirects pages without a locale path to one with a locale path by reading the `language_` cookie.
 *
 * This effectively routes requests as such:
 *
 * /home -> /zh-CN/home
 */
export const withLocale: MiddlewareFactory = next => {
  return async (request: NextRequest, event: NextFetchEvent) => {
    const {pathname} = request.nextUrl;
    const pathParts = pathname.split('/').filter(Boolean);

    if (pathParts.length === 1) {
      const slug = pathParts[0];

      const cookieLocale = request.cookies.get('language_')?.value;
      const locale =
        cookieLocale !== undefined && SUPPORTED_LOCALES.has(cookieLocale)
          ? cookieLocale
          : 'en-US';
      const redirectUrl = new URL(`/${locale}/${slug}`, request.url);
      return NextResponse.redirect(redirectUrl);
    }

    return next(request, event);
  };
};
