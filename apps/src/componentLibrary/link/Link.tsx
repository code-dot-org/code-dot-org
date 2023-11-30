import React from 'react';
import classNames from 'classnames';

import {ComponentSizeXSToL} from '@cdo/apps/componentLibrary/common/types';
import moduleStyles from './link.module.scss';

const disabledLinkProps = {
  role: 'link',
  'aria-disabled': true,
};

export interface LinkProps {
  /** Link content */
  children: React.ReactNode;
  /** Link id */
  id?: string;
  /** Custom class name */
  className?: string;
  /** Does the link go to an external source? */
  external?: boolean;
  /** Should the link open in a new tab? */
  openInNewTab?: boolean;
  /** Link destination */
  href: string;
  /** Is the link disabled? */
  disabled?: boolean;
  /** Callback for click event */
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  /** Size of link */
  size?: ComponentSizeXSToL;
  /** Color/type of link */
  color?: 'primary' | 'secondary';
}

// TODO:
// - fix typescript errors
// - Add tests
// - update changelog

/**
 * ### Production-ready Checklist:
 * * (?) implementation of component approved by design team;
 * * (?) has storybook, covered with stories and documentation;
 * * (?) has tests: test every prop, every state and every interaction that's js related;
 * * (see apps/test/unit/componentLibrary/LinkTest.jsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```WIP```
 *
 * Design System: Link Component.
 * Used for internal or external links. Shortcut for general <a> HTML tag (with DSCO styles applied).
 * Can be opened in new tab, have custom onClick, also can be disabled.
 */
const Link: React.FunctionComponent<LinkProps> = ({
  children,
  id,
  className,
  external,
  openInNewTab,
  href = '#',
  disabled,
  onClick,
  size = 'm',
  color = 'primary',
}) => {
  return (
    // eslint-disable-next-line react/jsx-no-target-blank
    <a
      className={classNames(
        moduleStyles.link,
        moduleStyles[`link-${color}`],
        moduleStyles[`link-${size}`],
        className
      )}
      href={!disabled ? href : undefined}
      id={id}
      onClick={!disabled ? onClick : undefined}
      rel={openInNewTab || external ? 'noopener noreferrer' : undefined}
      target={openInNewTab ? '_blank' : undefined}
      {...(disabled ? disabledLinkProps : {})}
    >
      {children}
    </a>
  );
};

export default Link;
