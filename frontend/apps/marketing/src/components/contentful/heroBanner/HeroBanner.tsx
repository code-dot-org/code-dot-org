import React from 'react';

import DSCOHeroBanner from '@code-dot-org/component-library/cms/heroBanner';
import {Theme} from '@code-dot-org/component-library/common/contexts';

import {externalLinkIconProps} from '@/components/common/constants';
import Video from '@/components/video';
import {LinkEntry} from '@/types/contentful/entries/Link';
import {ExperienceAsset} from '@/types/contentful/ExperienceAsset';

type HeroBannerProps = {
  /** HeroBanner content mode (theme) value */
  contentMode: Theme;
  /** HeroBanner image size (whether show with wide text (text is wider than image)) */
  imageSize: 'Small' | 'Big';
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
  /** Section Images, Array of Experience entries.
   * We always render the first image from the array */
  sectionImages?: ExperienceAsset[];
  /** Section Video URL */
  sectionVideoTitle?: string;
  /** Section Video Youtube ID */
  sectionVideoYouTubeId?: string;
  /** Section Video Fallback url */
  sectionVideoFallback?: string;
  /** Whether to show the section video captions */
  sectionVideoShowCaption?: boolean;
  /** HeroBanner Button Links, Array of Link Entries.
   *  We always render the first link from the array. **/
  buttonLinks?: LinkEntry[];
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
  announcementBannerLink?: LinkEntry[];
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
  sectionImages,
  sectionVideoTitle,
  sectionVideoYouTubeId,
  sectionVideoFallback,
  sectionVideoShowCaption,
  buttonLinks,
  partnerLogo,
  partnerCallout,
  backgroundImage,
  removeBackground = false,
  className,
}) => {
  const firstSectionImage = sectionImages?.[0];
  const firstButtonLink = buttonLinks?.[0];
  const firstAnnouncementBannerLink = announcementBannerLink?.[0];

  return (
    <DSCOHeroBanner
      data-theme={contentMode}
      withWideText={imageSize === 'Small'}
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
              link: firstAnnouncementBannerLink
                ? {
                    text: firstAnnouncementBannerLink.fields.label,
                    'aria-label': firstAnnouncementBannerLink.fields.ariaLabel,
                    href: firstAnnouncementBannerLink.fields.primaryTarget,
                    external:
                      firstAnnouncementBannerLink.fields.isThisAnExternalLink,
                  }
                : undefined,
            }
          : undefined
      }
      imageProps={
        firstSectionImage?.fields?.file?.url
          ? {
              src: firstSectionImage.fields.file.url,
              altText: firstSectionImage.fields.description || '',
            }
          : undefined
      }
      buttonProps={
        firstButtonLink
          ? {
              text: firstButtonLink.fields.label,
              href: firstButtonLink.fields.primaryTarget,
              ariaLabel: firstButtonLink.fields.ariaLabel,
              iconRight: firstButtonLink.fields.isThisAnExternalLink
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
