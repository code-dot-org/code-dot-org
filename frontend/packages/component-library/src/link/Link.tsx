import classNames from 'classnames';
import {HTMLAttributes} from 'react';

import {externalLinkIconProps} from '@/common/constants';
import {ComponentSizeXSToL} from '@/common/types';
import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';

import moduleStyles from './link.module.scss';

export interface LinkBaseProps extends HTMLAttributes<HTMLAnchorElement> {
  /** Link id */
  id?: string;
  /** Custom class name */
  className?: string;
  /** Does the link go to an external source? */
  external?: boolean;
  /** Should the link open in a new tab? */
  openInNewTab?: boolean;
  /** Link destination */
  href?: string;
  /** Is the link disabled? */
  disabled?: boolean;
  /** Callback for click event */
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  /** Size of link */
  size?: ComponentSizeXSToL;
  /** Type of link */
  type?: 'primary' | 'secondary';
  /** Role of link */
  role?: string;
}

export type LinkWithChildren = LinkBaseProps & {
  /** Link content */
  children: React.ReactNode;
  text?: never;
};

export type LinkWithText = LinkBaseProps & {
  /** Link text content */
  text: string;
  children?: never;
};

export type LinkProps = LinkWithChildren | LinkWithText;

/**
 * ### Production-ready Checklist:
 * * (✔) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✔) has tests: test every prop, every state and every interaction that's js related;
 * * (see ./__tests__/Link.test.tsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 *
 * Design System: Link Component.
 * Used for internal or external links. Shortcut for general <a> HTML tag (with DSCO styles applied).
 * Can be opened in new tab, have custom onClick, also can be disabled.
 */
const Link: React.FunctionComponent<LinkProps> = ({
  children,
  text,
  id,
  className,
  external,
  openInNewTab,
  href = '#',
  disabled,
  onClick,
  size = 'm',
  type = 'primary',
  role,
  ...HTMLAttributes
}) => {
  const isExternal = external !== undefined ? external : isExternalUrl(href);

  return (
    <a
      className={classNames(
        moduleStyles.link,
        moduleStyles[`link-${type}`],
        moduleStyles[`link-${size}`],
        className,
      )}
      href={!disabled ? href : undefined}
      id={id}
      onClick={!disabled ? onClick : undefined}
      rel={openInNewTab || isExternal ? 'noopener noreferrer' : undefined}
      target={(openInNewTab || undefined) && '_blank'}
      role={role}
      {...(disabled ? {'aria-disabled': true} : {})}
      {...HTMLAttributes}
    >
      {text || children}
      {isExternal && <FontAwesomeV6Icon {...externalLinkIconProps} />}
    </a>
  );
};

/**
 * Regex to check if a given URL starts with a protocol or double slash.
 *
 *  e.g.:
 * - https://example.com
 * - //example.com
 * - ftp://example.com
 * - mailto:example@example.com
 */
const ABSOLUTE_URL_REGEX = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

/**
 * Checks if a given URL is external
 *
 * Taken from https://github.com/remix-run/react-router/blob/20d8307d4a51c219f6e13e0b66461e7162d944e4/packages/react-router/lib/dom/lib.tsx#L1292-L1322
 *
 * Note: this currently only works client-side (because it uses window.location.href)
 */
const isExternalUrl = (href: string) => {
  const isAbsolute = ABSOLUTE_URL_REGEX.test(href);

  if (typeof href !== 'string' || !isAbsolute) {
    return false;
  }

  const isBrowser =
    typeof window !== 'undefined' &&
    typeof window.document !== 'undefined' &&
    typeof window.document.createElement !== 'undefined';

  if (!isBrowser) {
    return false;
  }

  // Only check for external origins client-side
  try {
    const currentUrl = new URL(window.location.href);
    const targetUrl = /^\/\//.test(href)
      ? new URL(currentUrl.protocol + href)
      : new URL(href);

    if (targetUrl.origin !== currentUrl.origin) {
      return true;
    }
  } catch {
    // invalid URL
  }

  return false;
};

export default Link;
