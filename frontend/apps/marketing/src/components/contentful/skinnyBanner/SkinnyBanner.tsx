import React from 'react';

import DSCOSkinnyBanner from '@code-dot-org/component-library/cms/skinnyBanner';
import {Theme} from '@code-dot-org/component-library/common/contexts';

import {externalLinkIconProps} from '@/components/common/constants';
import {getAbsoluteImageUrl} from '@/selectors/contentful/getImage';
import {LinkEntry} from '@/types/contentful/entries/Link';
import {ExperienceAsset} from '@/types/contentful/ExperienceAsset';

type SkinnyBannerProps = {
  /** SkinnyBanner content mode (theme) value */
  contentMode: Theme;
  /** SkinnyBanner cf styles*/
  className?: string;
  /** SkinnyBanner heading */
  heading: string;
  /** SkinnyBanner description */
  description?: string;
  /** Section Images, Array of Experience entries.
   * We always render the first image from the array */
  sectionImages?: ExperienceAsset[];
  /** SkinnyBanner Button Links, Array of Link Entries.
   *  We always render the first link from the array. **/
  buttonLinks?: LinkEntry[];
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
  sectionImages,
  buttonLinks,
  partnerLogo,
  partnerCallout,
  backgroundImage,
}) => {
  const firstSectionImage = sectionImages?.[0];
  const firstButtonLink = buttonLinks?.[0];

  return (
    <DSCOSkinnyBanner
      data-theme={contentMode}
      aria-labelledby={heading}
      className={className}
      heading={heading}
      description={description}
      imageProps={(() => {
        const firstSectionImageSrc =
          firstSectionImage && getAbsoluteImageUrl(firstSectionImage);

        return firstSectionImageSrc
          ? {
              src: firstSectionImageSrc,
              altText: firstSectionImage.fields.description || '',
            }
          : undefined;
      })()}
      buttonProps={
        firstButtonLink
          ? {
              text: firstButtonLink.fields.label,
              href: firstButtonLink.fields.primaryTarget,
              ariaLabel: firstButtonLink.fields.ariaLabel,
              iconRight: firstButtonLink.fields.isThisAnExternalLink
                ? externalLinkIconProps
                : undefined,
              target: firstButtonLink.fields.isThisAnExternalLink
                ? '_blank'
                : undefined,
            }
          : undefined
      }
      partner={(() => {
        const partnerLogoSrc = partnerLogo && getAbsoluteImageUrl(partnerLogo);

        return partnerLogoSrc
          ? {
              title: partnerCallout || 'In partnership with:',
              logo: {src: partnerLogoSrc},
            }
          : undefined;
      })()}
      backgroundImageUrl={getAbsoluteImageUrl(backgroundImage)}
    />
  );
};

export default SkinnyBanner;
