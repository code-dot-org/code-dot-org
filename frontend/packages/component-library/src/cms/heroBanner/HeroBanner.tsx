import classNames from 'classnames';
import {ReactNode, HTMLAttributes} from 'react';

import Alert from '@/alert';
import {LinkButton, LinkButtonProps} from '@/button';
import {Theme} from '@/common/contexts';
import {FontAwesomeV6IconProps} from '@/fontAwesomeV6Icon';
import Image, {ImageProps} from '@/image';
import {LinkProps} from '@/link';
import {Heading1, BodyOneText, BodyTwoText} from '@/typography';
import Video, {VideoProps} from '@/video';

import moduleStyles from './heroBanner.module.scss';

type AnnouncementBannerProps = {
  /** AnnouncementBanner icon */
  icon?: FontAwesomeV6IconProps;
  /** AnnouncementBanner text */
  text: string;
  /** AnnouncementBanner link */
  link?: LinkProps;
};

export interface HeroBannerProps extends HTMLAttributes<HTMLElement> {
  /** HeroBanner heading */
  heading: string | ReactNode;
  /** HeroBanner subHeading */
  subHeading?: string | ReactNode;
  /** HeroBanner description */
  description?: string | ReactNode;
  /** HeroBanner image */
  imageProps?: ImageProps;
  /** HeroBanner video component. We use this composition here to allow using HeroBanner component for ssr pages.
   * More context can be found in this slack thread: https://codedotorg.slack.com/archives/C07UW4ED66Q/p1744640489709969
   * */
  VideoComponent: typeof Video;
  /** HeroBanner video */
  videoProps?: VideoProps;
  /** HeroBanner link */
  buttonProps?: LinkButtonProps;
  /** HeroBanner announcementBanner */
  announcementBannerProps?: AnnouncementBannerProps;
  /** HeroBanner custom background color.
   *  backgroundImageUrl is higher priority then backgroundColor. */
  backgroundColor?: string;
  /** HeroBanner custom background url */
  backgroundImageUrl?: string;
  /** HeroBanner theme value.
   *  If you're using backgroundImageUrl - you should make sure you set correct theme value to HeroBanner.
   *  */
  'data-theme'?: Theme;
  /** Whether to show the background color */
  removeBackground?: boolean;
  /** HeroBanner whether show with wide text (text is wider than image) */
  withWideText?: boolean;
  /** HeroBanner partner prop */
  partner?: {title: string; logo: ImageProps};
  /** HeroBanner custom className  */
  className?: string;
}

/**
 * ## Production-ready Checklist:
 *  * (✔) implementation of component approved by design team;
 *  * (✔) has storybook, covered with stories and documentation;
 *  * (✔) has tests: test every prop, every state and every interaction that's js related;
 *  * (see ./__tests__/HeroBanner.test.tsx)
 *  * (✔) passes accessibility checks;
 *
 * ### Status: ```Ready for dev```
 *
 * Design System: HeroBanner Component.
 * Renders a Hero Banner/Section which serves as an opening section of a page. There should only be one Hero Banner
 * per page at the very top of the page under the header navigation.
 */
const HeroBanner: React.FC<HeroBannerProps> = ({
  heading,
  subHeading,
  description,
  partner,
  imageProps,
  VideoComponent,
  videoProps,
  buttonProps,
  announcementBannerProps,
  backgroundColor,
  backgroundImageUrl,
  removeBackground = false,
  withWideText = false,
  className,
  ...HTMLAttributes
}) => (
  <section
    role="banner"
    className={classNames(moduleStyles.heroBannerWrapper, className, {
      [moduleStyles['heroBanner-withWideText']]: withWideText,
    })}
    data-theme={HTMLAttributes['data-theme']}
    {...HTMLAttributes}
    style={{
      ...(HTMLAttributes.style ?? {}),
      backgroundColor: backgroundColor
        ? backgroundColor
        : HTMLAttributes.style?.backgroundColor,
      backgroundImage: backgroundImageUrl
        ? `url(${backgroundImageUrl})`
        : HTMLAttributes.style?.backgroundImage,
      ...(removeBackground ? {background: 'none'} : {}),
    }}
  >
    {announcementBannerProps && (
      <Alert
        data-theme={HTMLAttributes['data-theme'] === 'Dark' ? 'Light' : 'Dark'}
        className={moduleStyles.heroBannerAnnouncementBanner}
        text={announcementBannerProps.text}
        icon={announcementBannerProps.icon}
        link={announcementBannerProps.link}
      />
    )}
    <div className={classNames(moduleStyles.heroBannerContainer)}>
      <div className={moduleStyles.heroBannerTextContainer}>
        <div>
          <Heading1>{heading}</Heading1>

          {subHeading && <BodyOneText>{subHeading}</BodyOneText>}

          {description && <BodyTwoText>{description}</BodyTwoText>}

          {partner && (
            <span className={moduleStyles.heroBannerPartnerContainer}>
              {partner.title}
              <Image {...partner.logo} hasRoundedCorners={false} />
            </span>
          )}
        </div>
        <div>
          {buttonProps && (
            <LinkButton color="purple" type="primary" {...buttonProps} />
          )}
        </div>
      </div>
      {(imageProps || videoProps) && (
        <div className={moduleStyles.heroBannerMediaContainer}>
          {imageProps && !videoProps && <Image {...imageProps} />}
          {videoProps && <VideoComponent {...videoProps} />}
        </div>
      )}
    </div>
  </section>
);

export default HeroBanner;
