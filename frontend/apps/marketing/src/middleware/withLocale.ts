import {NextFetchEvent, NextRequest, NextResponse} from 'next/server';

import {SUPPORTED_LOCALES} from '@/config/locale';
import {getContentfulSlug} from '@/contentful/slug/getContentfulSlug';

import {MiddlewareFactory} from './types';

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

    if (pathParts.length === 0 || SUPPORTED_LOCALES.has(maybeLocale)) {
      // If the first part of the path is a supported locale or there are no subpaths, we don't need to redirect
      return next(request, event);
    }

    const slug = getContentfulSlug(pathParts);

    const cookieLocale = request.cookies.get('language_')?.value;
    const locale =
      cookieLocale !== undefined && SUPPORTED_LOCALES.has(cookieLocale)
        ? cookieLocale
        : 'en-US';
    const redirectUrl = new URL(`/${locale}/${slug}`, request.url);
    return NextResponse.redirect(redirectUrl);
  };
};
