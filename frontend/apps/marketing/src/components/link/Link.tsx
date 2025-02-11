import '@code-dot-org/component-library/link/index.css';
import {default as DSCOLink} from '@code-dot-org/component-library/link';
import React, {ReactNode} from 'react';
import {ComponentSizeXSToL} from '@code-dot-org/component-library/common/types';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';

import moduleStyles from './link.module.scss';

export type LinkProps = {
  /** Link content */
  children: ReactNode;
  /** Link URL */
  href: string;
  /** Link color */
  color: 'purple' | 'white';
  /** Link vertical margin */
  bottomMargin: 'none' | 'xs' | 's' | 'm';
  /** Link size */
  size: ComponentSizeXSToL;
  /** Whether Link is for internal code.org pages, or external web page. (external links are opened in new tab) */
  isLinkExternal: boolean;
  /** ClassName passed by Contentful to apply styles that are set through Contentful native editor */
  className?: string;
};

const Link: React.FunctionComponent<LinkProps> = ({
  children,
  href,
  color,
  size,
  bottomMargin,
  isLinkExternal,
  className,
}) => {
  return (
    <DSCOLink
      href={href}
      openInNewTab={isLinkExternal}
      size={size}
      className={classNames(
        moduleStyles.link,
        moduleStyles[`link-${color}`],
        moduleStyles[`link-${size}`],
        moduleStyles[`link-bottomMargin-${bottomMargin}`],
        className,
      )}
    >
      {children}
      {isLinkExternal && (
        <FontAwesomeV6Icon iconName="up-right-from-square" iconStyle="solid" />
      )}
    </DSCOLink>
  );
};

export default Link;
