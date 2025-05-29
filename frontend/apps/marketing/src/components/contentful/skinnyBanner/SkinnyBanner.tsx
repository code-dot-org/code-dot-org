import React from 'react';

import DSCOSkinnyBanner from '@code-dot-org/component-library/cms/skinnyBanner';
import {Theme} from '@code-dot-org/component-library/common/contexts';

import {externalLinkIconProps} from '@/components/common/constants';
import {LinkEntry} from '@/types/contentful/entries/Link';

type SkinnyBannerProps = {
  /** SkinnyBanner content mode (theme) value */
  contentMode: Theme;
  /** SkinnyBanner cf styles*/
  className?: string;
  /** SkinnyBanner heading */
  heading: string;
  /** SkinnyBanner description */
  description?: string;
  /** Section Image URL */
  sectionImage?: string;
  /** SkinnyBanner Button Link Entry **/
  buttonLink?: LinkEntry;
  /** SkinnyBanner partner image URL */
  partnerLogo?: string;
  /** SkinnyBanner partner callout (title) */
  partnerCallout?: string;
  /** SkinnyBanner background image URL */
  backgroundImage?: string;
};

const SkinnyBanner: React.FunctionComponent<SkinnyBannerProps> = ({
  // Style Props
  contentMode,
  className,
  // Content Props
  heading,
  description,
  sectionImage,
  buttonLink,
  partnerLogo,
  partnerCallout,
  backgroundImage,
}) => (
  <DSCOSkinnyBanner
    data-theme={contentMode}
    className={className}
    heading={heading}
    description={description}
    imageProps={sectionImage ? {src: sectionImage} : undefined}
    buttonProps={
      buttonLink
        ? {
            text: buttonLink.fields.label,
            href: buttonLink.fields.primaryTarget,
            ariaLabel: buttonLink.fields.ariaLabel,
            iconRight: buttonLink.fields.isThisAnExternalLink
              ? externalLinkIconProps
              : undefined,
          }
        : undefined
    }
    partner={
      partnerLogo
        ? {
            title: partnerCallout || 'In partnership with:',
            logo: {src: partnerLogo},
          }
        : undefined
    }
    backgroundImageUrl={backgroundImage}
  />
);

export default SkinnyBanner;
