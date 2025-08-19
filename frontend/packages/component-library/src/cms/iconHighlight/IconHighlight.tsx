import classNames from 'classnames';
import {Key, ReactNode, HTMLAttributes} from 'react';

import FontAwesomeV6Icon, {FontAwesomeV6IconProps} from '@/fontAwesomeV6Icon';
import Link, {LinkProps} from '@/link';
import {Heading3, BodyThreeText} from '@/typography';

import moduleStyles from './iconHighlight.module.scss';

export type IconHighlightLinkProps = LinkProps & {
  key: Key;
  external?: boolean;
};

export interface IconHighlightProps extends HTMLAttributes<HTMLElement> {
  /** IconHighlight heading */
  heading: string | ReactNode;
  /** IconHighlight content */
  text: string | ReactNode;
  /** IconHighlight icon */
  icon: FontAwesomeV6IconProps;
  /** IconHighlight links */
  links?: IconHighlightLinkProps[];
  /** IconHighlight class  */
  className?: string;
}

/**
 * ## Production-ready Checklist:
 *  * (✔) implementation of component approved by design team;
 *  * (✔) has storybook, covered with stories and documentation;
 *  * (✔) has tests: test every prop, every state and every interaction that's js related;
 *  * (see ./__tests__/IconHighlight.test.tsx)
 *  * (✔) passes accessibility checks;
 *
 * ### Status: ```Ready for dev```
 *
 * Design System: IconHighlight Component.
 * Renders a card with a customizable icon, heading, text, and optional links.
 */
const IconHighlight: React.FC<IconHighlightProps> = ({
  heading,
  text,
  icon,
  className,
  links = [],
  ...HTMLAttributes
}: IconHighlightProps) => (
  <div
    {...HTMLAttributes}
    className={classNames(moduleStyles.iconHighlight, className)}
  >
    <FontAwesomeV6Icon
      {...icon}
      role="presentation"
      aria-hidden="true"
      className={classNames(moduleStyles.iconHighlightIcon, icon.className)}
    />

    <Heading3
      visualAppearance={'heading-sm'}
      className={moduleStyles.iconHighlightHeading}
    >
      {heading}
    </Heading3>

    <BodyThreeText className={moduleStyles.iconHighlightText}>
      {text}
    </BodyThreeText>

    {!!links.length && (
      <ul className={moduleStyles.iconHighlightLinkList}>
        {links.map(({key, className, text, external, ...link}) => (
          <li key={key}>
            <Link
              {...link}
              size="s"
              className={classNames(moduleStyles.iconHighlightLink, className)}
            >
              {text}
              {external && (
                <FontAwesomeV6Icon
                  iconName="up-right-from-square"
                  iconStyle="solid"
                  role="img"
                  aria-label="external link"
                />
              )}
            </Link>
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default IconHighlight;
