import OpenInNew from '@mui/icons-material/OpenInNew';
import MuiLink from '@mui/material/Link';
import classNames from 'classnames';
import {EntryFields} from 'contentful';
import React, {ReactNode} from 'react';

import {
  ComponentSize,
  RemoveMarginBottomProps,
  TypographyColor,
} from '@/components/common/types';

export type LinkProps = RemoveMarginBottomProps & {
  /** Link Label */
  children: ReactNode;
  /** Link URL */
  href: string;
  /** Link color */
  color?: Exclude<TypographyColor, 'secondary'>;
  /** Link size */
  size: ComponentSize;
  /** Whether Link is for internal code.org pages, or external web page. (external links are opened in new tab) */
  isLinkExternal: boolean;
  /** Aria label for the link */
  ariaLabel?: EntryFields.Text;
  /** Custom classname */
  className?: string | object;
};

const styles = {
  container: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.5,
    'html[dir="rtl"] & svg': {
      transform: 'scaleX(-1)',
    },
  },
};

const Link: React.FunctionComponent<LinkProps> = ({
  children,
  href,
  color = 'primary',
  size,
  isLinkExternal,
  removeMarginBottom,
  ariaLabel,
  className,
}) => (
  <MuiLink
    className={classNames(
      `link--size-${size}`,
      `link--color-${color}`,
      className,
    )}
    href={href}
    aria-label={ariaLabel}
    target={isLinkExternal ? '_blank' : undefined}
    rel={isLinkExternal ? 'noopener noreferrer' : undefined}
    sx={{
      marginBottom: removeMarginBottom ? 0 : undefined,
      ...styles.container,
    }}
  >
    {children}
    {isLinkExternal && <OpenInNew fontSize="inherit" />}
  </MuiLink>
);

export default Link;
