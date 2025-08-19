'use client';
import {usePathname, useRouter} from 'next/navigation';

import FooterMui, {FooterProps} from '@/components/footerMui';
import {Brand} from '@/config/brand';
import {LOCALIZE_JS_CONFIG_MAP} from '@/config/locale';

import {COPYRIGHT_TEXT, SITE_LINKS, SOCIAL_LINKS} from './config';

export const defaultProps: Omit<FooterProps, 'languages' | 'onLanguageChange'> =
  {
    brand: Brand.CS_FOR_ALL,
    siteLinks: SITE_LINKS,
    socialLinks: SOCIAL_LINKS,
    copyright: COPYRIGHT_TEXT,
  };

interface GlobalFooterProps {
  locale: string;
}

const FooterCSforAll = ({locale}: GlobalFooterProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const handleLanguageChange = (localeCode: string) => {
    const newPathName = pathname.replace(
      /^\/([a-z]{2}(-[A-Z]{2})?)(?=\/|$)/,
      `/${localeCode}`,
    );
    router.push(newPathName);
    Localize.setLanguage(localeCode);
  };

  return (
    <FooterMui
      {...defaultProps}
      onLanguageChange={handleLanguageChange}
      selectedLocaleCode={locale}
      languages={LOCALIZE_JS_CONFIG_MAP}
    />
  );
};

export default FooterCSforAll;
