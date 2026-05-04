import {useEffect, useRef, useState} from 'react';

import Footer from '@code-dot-org/component-library/footer';
import type {FooterLanguageOption} from '@code-dot-org/component-library/footer';
import {CodeStudioConfig as siteConfig} from '@code-dot-org/core';
import {localization} from '@code-dot-org/core/plugins/localization';
import type {LanguageInfo} from '@code-dot-org/core/plugins/localization';

import {getBrandConfig} from '@/config/brand';
import {FOOTER_LINKS} from '@/config/footerLinks';

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
        setState({locale: localization.locale, locales: localization.locales});
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

  const languages: FooterLanguageOption[] = locales.map(l => ({
    value: l.value,
    text: l.text,
  }));

  const fineprint = (
    <>
      Engineers from Amazon, Google, and Microsoft helped create these
      materials.
      <br />
      Minecraft™ © Microsoft. All Rights Reserved. Star Wars™ © Disney and
      Lucasfilm. All Rights Reserved. Frozen™ © Disney. All Rights Reserved.
      Ice Age™ © 20th Century Fox. All Rights Reserved. Angry Birds ©
      2009-2026 Rovio Entertainment Ltd. All Rights Reserved. Plants vs.
      Zombies™ © Electronic Arts Inc. All Rights Reserved. DreamWorks The Bad
      Guys © DreamWorks Animation LLC. All Rights Reserved. Paramount Pictures
      Transformers One © Paramount Pictures. All Rights Reserved.
      <br />
      {brandConfig.trademark}
      <br />
      Built on GitHub from Microsoft
    </>
  );

  return (
    <Footer
      siteLinks={FOOTER_LINKS}
      copyright={brandConfig.copyright}
      fineprint={fineprint}
      imageLink={{
        src: poweredByAwsSrc,
        altText: 'Powered by AWS Cloud Computing',
        href: 'https://aws.amazon.com/what-is-cloud-computing',
        external: true,
      }}
      languages={languages}
      selectedLocaleCode={locale}
      languagesReady={isReady}
      onLanguageChange={code => {
        localization.locale = code;
      }}
    />
  );
};

export default StudioFooter;
