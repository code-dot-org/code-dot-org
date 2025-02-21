import '@code-dot-org/component-library/link/index.css';
import {default as DSCOLink} from '@code-dot-org/component-library/link';
import {ComponentSizeXSToL} from '@code-dot-org/component-library/common/types';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React, {ReactNode} from 'react';
import classNames from 'classnames';

import moduleStyles from './link.module.scss';

export type LinkProps = {
  /** Link Label */
  children: ReactNode;
  /** Link URL */
  href: string;
  /** Link size */
  size: ComponentSizeXSToL;
  /** Whether Link is for internal code.org pages, or external web page. (external links are opened in new tab) */
  isLinkExternal: boolean;
};

const Link: React.FunctionComponent<LinkProps> = ({
  children,
  href,
  size,
  isLinkExternal,
}) => (
  <DSCOLink
    href={href}
    openInNewTab={isLinkExternal}
    size={size}
    className={classNames(moduleStyles.link, moduleStyles[`link-size-${size}`])}
  >
    {children}
    {isLinkExternal && (
      <FontAwesomeV6Icon iconName="up-right-from-square" iconStyle="solid" />
    )}
  </DSCOLink>
);

export default Link;
