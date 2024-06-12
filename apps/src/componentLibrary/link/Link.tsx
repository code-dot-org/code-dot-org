import classNames from 'classnames';
import React from 'react';

import {ComponentSizeXSToL} from '@cdo/apps/componentLibrary/common/types';

import moduleStyles from './link.module.scss';

type LinkBaseProps = {
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
  /** Type of link */
  type?: 'primary' | 'secondary';
};

type LinkWithChildren = LinkBaseProps & {
  /** Link content */
  children: React.ReactNode;
  text?: never;
};

type LinkWithText = LinkBaseProps & {
  /** Link text content */
  text: string;
  children?: never;
};

export type LinkProps = LinkWithChildren | LinkWithText;

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
}) => {
  return (
    <a
      className={classNames(
        moduleStyles.link,
        moduleStyles[`link-${type}`],
        moduleStyles[`link-${size}`],
        className
      )}
      href={!disabled ? href : undefined}
      id={id}
      onClick={!disabled ? onClick : undefined}
      rel={openInNewTab || external ? 'noopener noreferrer' : undefined}
      target={(openInNewTab || undefined) && '_blank'}
      {...(disabled ? {'aria-disabled': true} : {})}
    >
      {text || children}
    </a>
  );
};

export default Link;
