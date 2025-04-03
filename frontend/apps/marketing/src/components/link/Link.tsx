import classNames from 'classnames';
import {EntryFields} from 'contentful';
import React, {ReactNode} from 'react';

import {ComponentSizeXSToL} from '@code-dot-org/component-library/common/types';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {default as DSCOLink} from '@code-dot-org/component-library/link';

import {externalLinkIconProps} from '@/components/common/constants';
import {RemoveMarginBottomProps} from '@/components/common/types';

import moduleStyles from './link.module.scss';

export type LinkProps = RemoveMarginBottomProps & {
  /** Link Label */
  children: ReactNode;
  /** Link URL */
  href: string;
  /** Link size */
  size: ComponentSizeXSToL;
  /** Whether Link is for internal code.org pages, or external web page. (external links are opened in new tab) */
  isLinkExternal: boolean;
  /** Aria label for the link */
  ariaLabel?: EntryFields.Text;
};

const Link: React.FunctionComponent<LinkProps> = ({
  children,
  href,
  size,
  isLinkExternal,
  removeMarginBottom,
  ariaLabel,
}) => (
  <DSCOLink
    href={href}
    aria-label={ariaLabel}
    openInNewTab={isLinkExternal}
    size={size}
    className={classNames(
      moduleStyles.link,
      moduleStyles[`link-size-${size}`],
      removeMarginBottom && moduleStyles['link-removeMarginBottom'],
    )}
  >
    {children}
    {isLinkExternal && <FontAwesomeV6Icon {...externalLinkIconProps} />}
  </DSCOLink>
);

export default Link;
