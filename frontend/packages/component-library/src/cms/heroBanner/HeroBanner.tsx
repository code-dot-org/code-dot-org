import classNames from 'classnames';
import {ReactNode, HTMLAttributes} from 'react';

import {LinkButton, LinkButtonProps} from '@/button';
import Image, {ImageProps} from '@/image';
import {Heading1, BodyOneText, BodyTwoText} from '@/typography';
import Video, {VideoProps} from '@/video';

import moduleStyles from './heroBanner.module.scss';

export interface HeroBannerProps extends HTMLAttributes<HTMLElement> {
  /** HeroBanner heading */
  heading: string | ReactNode;
  /** HeroBanner subHeading */
  subHeading?: string | ReactNode;
  /** HeroBanner description */
  description?: string | ReactNode;
  /** HeroBanner image */
  imageProps?: ImageProps;
  /** HeroBanner video */
  videoProps?: VideoProps;
  /** HeroBanner link */
  buttonProps?: LinkButtonProps;
  /** HeroBanner custom background url */
  backgroundImageUrl?: string;
  /** Whether to show the background color */
  removeBackground?: boolean;
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
 * Renders a Hero Banner/Section which serves as an opening section of a page.
 */
const HeroBanner: React.FC<HeroBannerProps> = ({
  heading,
  subHeading,
  description,
  partner,
  buttonProps,
  imageProps,
  videoProps,
  className,
  ...HTMLAttributes
}) => (
  <section
    {...HTMLAttributes}
    className={classNames(moduleStyles.heroBannerWrapper, className)}
  >
    <div className={classNames(moduleStyles.heroBannerContainer)}>
      <div className={moduleStyles.heroBannerDescriptiveSection}>
        <Heading1>{heading}</Heading1>

        {subHeading && <BodyOneText>{subHeading}</BodyOneText>}

        {description && <BodyTwoText>{description}</BodyTwoText>}

        {partner && (
          <span className={moduleStyles.heroBannerPartnerSection}>
            {partner.title}
            <Image {...partner.logo} />
          </span>
        )}

        {buttonProps && <LinkButton {...buttonProps} />}
      </div>
      <div className={moduleStyles.heroBannerVisualSection}>
        {imageProps && !videoProps && <Image {...imageProps} />}
        {videoProps && <Video {...videoProps} />}
      </div>
    </div>
  </section>
);

export default HeroBanner;
