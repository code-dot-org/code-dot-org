import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import Footer from '@code-dot-org/component-library/footer';
import {CodeStudioConfig as siteConfig} from '@code-dot-org/core';
import {localization} from '@code-dot-org/core/plugins/localization';
import type {LanguageInfo} from '@code-dot-org/core/plugins/localization';

import {getBrandConfig} from '@/config/brand';
import {getFooterLinks} from '@/config/footerLinks';

import poweredByAwsSrc from './powered-by-aws.webp';

/**
 * Subscribes to the localization singleton and tracks readiness so the
 * language picker shows a skeleton until LocalizeJS resolves, then
 * switches to the populated select.
 */
function useLocaleSelectorState(): {
  locale: string;
  locales: LanguageInfo[];
  isReady: boolean;
} {
  const [state, setState] = useState({
    locale: localization.locale,
    locales: localization.locales,
  });
  const [isReady, setIsReady] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const onChange = () => {
      if (mountedRef.current) {
        setState({locale: localization.locale, locales: localization.locales});
      }
    };

    localization.on('change', onChange);

    localization.waitUntilLoaded().then(() => {
      if (mountedRef.current) {
        setIsReady(true);
        setState({
          locale: localization.locale,
          locales: localization.locales,
        });
      }
    });

    return () => {
      mountedRef.current = false;
      localization.off('change', onChange);
    };
  }, []);

  return {locale: state.locale, locales: state.locales, isReady};
}

/**
 * Studio footer composer. Assembles brand-aware content from SiteConfig
 * and localization state, then renders the design-system Footer primitive.
 * Standalone-from-Rails: no Rails endpoints or meta tags are read here.
 */
const StudioFooter = () => {
  const brand = siteConfig.brand;
  const brandConfig = getBrandConfig(brand);
  const {locale, locales, isReady} = useLocaleSelectorState();

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
