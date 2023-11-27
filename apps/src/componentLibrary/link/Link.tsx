import React from 'react';
import classNames from 'classnames';

import {ComponentSizeXSToL} from '@cdo/apps/componentLibrary/common/types';
import moduleStyles from './link.module.scss';

export interface LinkProps {
  /** Link content */
  children: React.ReactNode;
  /** Custom class name */
  className?: string;
  /** Does the link go to an external source? */
  external?: boolean;
  /** Link destination */
  href: string;
  /** Link id */
  id?: string;
  /** Callback for click event */
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  /** Should the link open in a new tab? */
  openInNewTab?: boolean;
  /** Size of link */
  size?: ComponentSizeXSToL;
}

// TODO:
// - How to handle disabled state?
// - Add storybook
// - Add tests

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
 * Can be used to render a checkbox or as a part of bigger/more complex components (e.g. Checkbox Dropdown).
 */
const Link: React.FunctionComponent<LinkProps> = ({
  children,
  className,
  external,
  href,
  id,
  onClick,
  openInNewTab,
  size = 'm',
}) => {
  return (
    // eslint-disable-next-line react/jsx-no-target-blank
    <a
      className={classNames(
        moduleStyles.link,
        moduleStyles[`link-${size}`],
        className
      )}
      href={href}
      id={id}
      onClick={onClick}
      rel={openInNewTab || external ? 'noopener noreferrer' : undefined}
      target={openInNewTab ? '_blank' : undefined}
    >
      {children}
    </a>
  );
};

export default Link;
