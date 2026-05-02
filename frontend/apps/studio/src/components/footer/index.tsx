import {Footer} from '@code-dot-org/component-library/footer';
import {CodeStudioConfig} from '@code-dot-org/core';
import {
  localization,
  useLocalization,
} from '@code-dot-org/core/plugins/localization';

import poweredByAws from '@/assets/powered-by-aws.webp';
import {getBrandConfig} from '@/config/brand';
import {FOOTER_LINKS} from '@/config/footerLinks';

/**
 * Fineprint block: Amazon/Google/Microsoft engineers credit, art-IP notices,
 * and the "Built on GitHub" attribution.
 */
const FINEPRINT = (
  <>
    <span>
      Engineers from Amazon, Google, and Microsoft helped create these
      materials.
    </span>
    <span>
      Minecraft™ © Microsoft. All Rights Reserved. Star Wars™ © Disney and
      Lucasfilm. All Rights Reserved. Frozen™ © Disney. All Rights Reserved.
      Angry Birds™ © Rovio Entertainment Ltd. All Rights Reserved. Plants vs.
      Zombies™ © Electronic Arts Inc. All Rights Reserved.
    </span>
    <span>Built on GitHub from Microsoft</span>
  </>
);

/** Attribution image for the AWS cloud computing credit. */
const IMAGE_LINK = {
  src: poweredByAws,
  altText: 'Powered by AWS Cloud Computing',
  href: 'https://aws.amazon.com/what-is-cloud-computing',
  external: true as const,
};

/** Studio footer composer — assembles brand config, locale state, and static content. */
export function StudioFooter() {
  const brandConfig = getBrandConfig(CodeStudioConfig.brand);
  const {locale, locales, isReady} = useLocalization();

  return (
    <Footer
      siteLinks={FOOTER_LINKS}
      copyright={brandConfig.trademark}
      fineprint={FINEPRINT}
      imageLink={IMAGE_LINK}
      languages={locales}
      selectedLocaleCode={locale}
      languagesLoading={!isReady}
      onLanguageChange={code => {
        localization.locale = code;
      }}
    />
  );
}
