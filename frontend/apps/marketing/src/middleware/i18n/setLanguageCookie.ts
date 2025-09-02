import {NextResponse} from 'next/server';

import {Brand} from '@/config/brand';
import {
  getProductionCanonicalRootDomain,
  isAllowedProductionCanonicalHostname,
} from '@/config/host';
import {getDashboardLocale, SupportedLocale} from '@/config/locale';
import {Stage} from '@/config/stage';

interface SetLanguageCookieParams {
  response: NextResponse;
  maybeLocale: SupportedLocale;
  stage: Stage;
  brand: Brand;
  hostname: string | null;
}

export const setLanguageCookie = ({
  response,
  maybeLocale,
  stage,
  brand,
  hostname,
}: SetLanguageCookieParams) => {
  const cookieDomain = isAllowedProductionCanonicalHostname(brand, hostname)
    ? hostname
    : getProductionCanonicalRootDomain(brand);

  response.cookies.set('language_', getDashboardLocale(maybeLocale), {
    path: '/',
    domain:
      stage === 'production' && brand === Brand.CODE_DOT_ORG // Only set the domain for the corporate website
        ? `.${cookieDomain}`
        : undefined,
  });
};
