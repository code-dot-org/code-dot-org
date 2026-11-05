import {useCallback, useMemo} from 'react';

import Footer from '@code-dot-org/component-library/footer';
import {CodeStudioConfig as siteConfig} from '@code-dot-org/core';
import {
  localization,
  useLocales,
} from '@code-dot-org/core/plugins/localization';

import {getBrandConfig} from '@/config/brand';
import {getFooterLinks} from '@/config/footerLinks';

import poweredByAwsSrc from './powered-by-aws.webp';

/**
 * Studio footer composer. Assembles brand-aware content from SiteConfig
 * and localization state, then renders the design-system Footer primitive.
 * Standalone-from-Rails: no Rails endpoints or meta tags are read here.
 */
const StudioFooter = () => {
  const brand = siteConfig.brand;
  const brandConfig = getBrandConfig(brand);
  const {locale, locales, isReady} = useLocales();

  const siteLinks = useMemo(() => getFooterLinks(), []);

  const handleLanguageChange = useCallback((code: string) => {
    localization.locale = code;
  }, []);

  return (
    <Footer
      siteLinks={siteLinks}
      copyright={brandConfig.copyright}
      fineprint={brandConfig.fineprint}
      imageLink={{
        src: poweredByAwsSrc,
        altText: 'Powered by AWS Cloud Computing',
        href: 'https://aws.amazon.com/what-is-cloud-computing',
        external: true,
      }}
      languages={isReady ? locales : 'loading'}
      selectedLocaleCode={locale}
      onLanguageChange={handleLanguageChange}
    />
  );
};

export default StudioFooter;
