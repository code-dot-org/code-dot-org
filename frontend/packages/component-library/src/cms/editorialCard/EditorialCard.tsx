import classNames from 'classnames';
import {omit} from 'lodash';
import {HTMLAttributes, ReactNode} from 'react';

import FontAwesomeV6Icon, {FontAwesomeV6IconProps} from '@/fontAwesomeV6Icon';
import Image, {ImageProps} from '@/image';
import Link, {LinkProps} from '@/link';
import {Heading3, BodyThreeText} from '@/typography';

import moduleStyles from './editorialCard.module.scss';

export enum EDITORIAL_CARD_LAYOUTS {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
}

export interface EditorialCardProps extends HTMLAttributes<HTMLElement> {
  /** EditorialCard image or icon */
  media: ImageProps | FontAwesomeV6IconProps;
  /** EditorialCard heading */
  heading: string | ReactNode;
  /** EditorialCard content */
  text: string | ReactNode;
  /** EditorialCard link */
  link?: LinkProps;
  /** EditorialCard class */
  className?: string;
  /** EditorialCard layout */
  layout?: EDITORIAL_CARD_LAYOUTS;
}

/**
 * ## Production-ready Checklist:
 *  * (✔) implementation of component approved by design team;
 *  * (✔) has storybook, covered with stories and documentation;
 *  * (✔) has tests: test every prop, every state and every interaction that's js related;
 *  * (see ./__tests__/Spacer.test.tsx)
 *  * (✔) passes accessibility checks;
 *
 * ### Status: ```Ready for dev```
 *
 * Design System: EditorialCard Component.
 * Acts as an editorial card.
 */
const EditorialCard: React.FC<EditorialCardProps> = ({
  media,
  heading,
  text,
  link,
  className,
  layout = EDITORIAL_CARD_LAYOUTS.HORIZONTAL,
  ...HTMLAttributes
}) => (
  <aside
    {...HTMLAttributes}
    className={classNames(
      moduleStyles.editorialCard,
      moduleStyles[`editorialCard-layout-${layout}`],
      className,
    )}
  >
    <div className={moduleStyles.editorialCardMedia} aria-hidden="true">
      {(media as ImageProps)?.src && (
        <Image
          {...(media as ImageProps)}
          className={classNames(
            moduleStyles.editorialCardImage,
            media.className,
          )}
        />
      )}

      {(media as FontAwesomeV6IconProps)?.iconName && (
        <FontAwesomeV6Icon
          {...(media as FontAwesomeV6IconProps)}
          className={classNames(
            moduleStyles.editorialCardIcon,
            media.className,
          )}
        />
      )}
    </div>

    <div className={moduleStyles.editorialCardContent}>
      <Heading3
        visualAppearance="heading-sm"
        className={moduleStyles.editorialCardHeading}
      >
        {heading}
      </Heading3>

      <BodyThreeText className={moduleStyles.editorialCardText}>
        {text}
      </BodyThreeText>

      {link && (
        <Link
          {...omit(link, ['text'])}
          className={classNames(moduleStyles.editorialCardLink, link.className)}
          size="s"
        >
          {link.text}
          {link.external && (
            <FontAwesomeV6Icon
              iconName="up-right-from-square"
              iconStyle="solid"
              role="img"
              aria-label="external link"
            />
          )}
        </Link>
      )}
    </div>
  </aside>
);

export default EditorialCard;
