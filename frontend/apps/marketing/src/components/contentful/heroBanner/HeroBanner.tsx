import React from 'react';

import DSCOHeroBanner from '@code-dot-org/component-library/cms/heroBanner';
import {Theme} from '@code-dot-org/component-library/common/contexts';

import {externalLinkIconProps} from '@/components/common/constants';
import Video from '@/components/video';

type HeroBannerProps = {
  /** HeroBanner content mode (theme) value */
  contentMode: Theme;
  /** HeroBanner image size (whether show with wide text (text is wider than image)) */
  imageSize: 'Big' | 'Large';
  /** Whether to show the background color */
  removeBackground?: boolean;
  /** HeroBanner cf styles*/
  className?: string;
  /** HeroBanner heading */
  heading: string;
  /** HeroBanner subHeading */
  subHeading?: string;
  /** HeroBanner description */
  description?: string;
  /** Section Image URL */
  sectionImage?: string;
  // sectionVideo?: ExperienceAsset;
  /** HeroBanner button label */
  buttonLabel?: string;
  /** HeroBanner button URL */
  buttonUrl?: string;
  /** HeroBanner button is external link */
  buttonIsLinkExternal?: boolean;
  /** HeroBanner button aria label */
  buttonAriaLabel?: string;
  /** HeroBanner partner image URL */
  partnerLogo?: string;
  /** HeroBanner partner callout (title) */
  partnerCallout?: string;
  /** HeroBanner background image URL */
  backgroundImage?: string;
};

const HeroBanner: React.FunctionComponent<HeroBannerProps> = ({
  // Style Props
  contentMode,
  imageSize,
  // Content Props
  heading,
  subHeading,
  description,
  sectionImage,
  // sectionVideo,
  buttonLabel,
  buttonUrl,
  buttonIsLinkExternal,
  buttonAriaLabel,
  partnerLogo,
  partnerCallout,
  backgroundImage,
  removeBackground = false,
  className,
}) => {
  return (
    <DSCOHeroBanner
      data-theme={contentMode}
      withWideText={imageSize === 'Big'}
      className={className}
      heading={heading}
      subHeading={subHeading}
      description={description}
      imageProps={sectionImage ? {src: sectionImage} : undefined}
      VideoComponent={Video}
      buttonProps={{
        text: buttonLabel,
        href: buttonUrl,
        ariaLabel: buttonAriaLabel,
        iconRight: buttonIsLinkExternal ? externalLinkIconProps : undefined,
      }}
      partner={
        partnerLogo && partnerCallout
          ? {title: partnerCallout, logo: {src: partnerLogo}}
          : undefined
      }
      backgroundImageUrl={backgroundImage}
      videoProps={{youTubeId: 'Ok-xpKjKp2g'}}
      removeBackground={removeBackground}
    />
  );
};

export default HeroBanner;
