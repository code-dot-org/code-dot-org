import classNames from 'classnames';
import {ReactNode, HTMLAttributes} from 'react';

import {LinkButton, LinkButtonProps} from '@/button';
import {Theme} from '@/common/contexts';
import Image, {ImageProps} from '@/image';
import {Heading2, BodyTwoText} from '@/typography';

import moduleStyles from './skinnyBanner.module.scss';

export interface SkinnyBannerProps extends HTMLAttributes<HTMLElement> {
  /** SkinnyBanner heading */
  heading: string | ReactNode;
  /** SkinnyBanner description */
  description?: string | ReactNode;
  /** SkinnyBanner image */
  imageProps?: ImageProps;
  /** SkinnyBanner link */
  buttonProps?: LinkButtonProps;
  /** SkinnyBanner custom background color.
   *  backgroundImageUrl is higher priority then backgroundColor. */
  backgroundColor?: string;
  /** SkinnyBanner custom background url */
  backgroundImageUrl?: string;
  /** SkinnyBanner theme value.
   *  If you're using backgroundImageUrl - you should make sure you set correct theme value to SkinnyBanner.
   *  */
  'data-theme'?: Theme;
  /** SkinnyBanner partner prop */
  partner?: {title: string; logo: ImageProps};
  /** SkinnyBanner custom className  */
  className?: string;
}

/**
 * ## Production-ready Checklist:
 *  * (✔) implementation of component approved by design team;
 *  * (✔) has storybook, covered with stories and documentation;
 *  * (✔) has tests: test every prop, every state and every interaction that's js related;
 *  * (see ./__tests__/SkinnyBanner.test.tsx)
 *  * (✔) passes accessibility checks;
 *
 * ### Status: ```Ready for dev```
 *
 * Design System: SkinnyBanner Component.
 * Renders a Skinny Banner/Section, a full-width marketing banner
 * placed inline with content. Supports backgrounds, images, text and a CTA.
 */
const SkinnyBanner: React.FC<SkinnyBannerProps> = ({
  heading,
  description,
  partner,
  imageProps,
  buttonProps,
  backgroundColor,
  backgroundImageUrl,
  className,
  ...HTMLAttributes
}) => (
  <aside
    className={classNames(moduleStyles.skinnyBannerWrapper, className)}
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
    }}
  >
    <div className={classNames(moduleStyles.skinnyBannerContainer)}>
      <div className={moduleStyles.skinnyBannerTextContainer}>
        <Heading2 visualAppearance="heading-sm">{heading}</Heading2>

        {description && <BodyTwoText>{description}</BodyTwoText>}

        {partner && (
          <span className={moduleStyles.skinnyBannerPartnerContainer}>
            {partner.title}
            <Image {...partner.logo} />
          </span>
        )}
      </div>

      {imageProps && (
        <div className={moduleStyles.skinnyBannerMediaContainer}>
          {imageProps && <Image {...imageProps} />}
        </div>
      )}
      {buttonProps && (
        <div className={moduleStyles.skinnyBannerButtonContainer}>
          <LinkButton color="purple" type="primary" {...buttonProps} />
        </div>
      )}
    </div>
  </aside>
);

export default SkinnyBanner;
