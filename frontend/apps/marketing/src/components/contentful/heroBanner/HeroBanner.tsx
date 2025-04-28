import React from 'react';

import DSCOHeroBanner from '@code-dot-org/component-library/cms/heroBanner';
import {Theme} from '@code-dot-org/component-library/common/contexts';

import {externalLinkIconProps} from '@/components/common/constants';
import Video from '@/components/video';
import {LinkEntry} from '@/types/contentful/entries/Link';

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
  /** Section Video URL */
  sectionVideoTitle?: string;
  /** Section Video Youtube ID */
  sectionVideoYouTubeId?: string;
  /** Section Video Fallback url */
  sectionVideoFallback?: string;
  /** Whether to show the section video captions */
  sectionVideoShowCaption?: boolean;
  /** Hero Banner Button Link Entry **/
  buttonLink?: LinkEntry;
  /** HeroBanner partner image URL */
  partnerLogo?: string;
  /** HeroBanner partner callout (title) */
  partnerCallout?: string;
  /** HeroBanner background image URL */
  backgroundImage?: string;
  /** HeroBanner announcement banner icon name */
  announcementBannerIconName?: string;
  /** HeroBanner announcement banner text */
  announcementBannerText?: string;
  /** HeroBanner announcement banner link  entry*/
  announcementBannerLink?: LinkEntry;
};

const HeroBanner: React.FunctionComponent<HeroBannerProps> = ({
  // Style Props
  contentMode,
  imageSize,
  announcementBannerIconName,
  // Content Props
  heading,
  subHeading,
  description,
  announcementBannerText = '',
  announcementBannerLink,
  sectionImage,
  sectionVideoTitle,
  sectionVideoYouTubeId,
  sectionVideoFallback,
  sectionVideoShowCaption,
  buttonLink,
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
      announcementBannerProps={
        announcementBannerText
          ? {
              icon: announcementBannerIconName
                ? {iconName: announcementBannerIconName}
                : undefined,
              text: announcementBannerText,
              link: announcementBannerLink
                ? {
                    text: announcementBannerLink.fields.label,
                    'aria-label': announcementBannerLink.fields.ariaLabel,
                    href: announcementBannerLink.fields.primaryTarget,
                    external:
                      announcementBannerLink.fields.isThisAnExternalLink,
                  }
                : undefined,
            }
          : undefined
      }
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
        partnerLogo && partnerCallout
          ? {title: partnerCallout, logo: {src: partnerLogo}}
          : undefined
      }
      backgroundImageUrl={backgroundImage}
      videoProps={
        sectionVideoYouTubeId || sectionVideoFallback
          ? {
              videoTitle: sectionVideoTitle,
              youTubeId: sectionVideoYouTubeId,
              videoFallback: sectionVideoFallback,
              showCaption: sectionVideoShowCaption,
            }
          : undefined
      }
      VideoComponent={Video}
      removeBackground={removeBackground}
    />
  );
};

export default HeroBanner;
