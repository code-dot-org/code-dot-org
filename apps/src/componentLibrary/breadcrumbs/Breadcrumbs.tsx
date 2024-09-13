import classNames from 'classnames';
import React from 'react';

import {ComponentSizeXSToL} from '@cdo/apps/componentLibrary/common/types';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';
import Link, {LinkBaseProps} from '@cdo/apps/componentLibrary/link';

import moduleStyles from './breadcrumbs.module.scss';

interface BreadcrumbProps extends LinkBaseProps {
  text: string;
  href: string;
}

export interface BreadcrumbsProps {
  /** List of Breadcrumbs to render */
  breadcrumbs: BreadcrumbProps[];
  /** Breadcrumbs name */
  name: string;
  /** Size of Breadcrumbs */
  size?: ComponentSizeXSToL;
  /** Custom className */
  className?: string;
}

/**
 * ### Production-ready Checklist:
 * * (✔) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✔) has tests: test every prop, every state and every interaction that's js related;
 * * (see apps/test/unit/componentLibrary/BreadcrumbsTest.tsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 *
 * Design System: Breadcrumbs Component.
 * Can be used to render Breadcrumbs or as a part of bigger/more complex components (e.g. forms).
 */
const Breadcrumbs: React.FunctionComponent<BreadcrumbsProps> = ({
  breadcrumbs,
  name,
  size = 'm',
  className,
}) => {
  return (
    <div
      className={classNames(
        moduleStyles.breadcrumbs,
        moduleStyles[`breadcrumbs-${size}`],
        className
      )}
      data-testid={`breadcrumbs-${name}`}
    >
      {breadcrumbs.map(({text, href, ...rest}, i) => (
        <React.Fragment key={`${text}-${href}`}>
          <Link
            {...rest}
            text={text}
            href={href}
            className={classNames(moduleStyles.breadcrumb, rest.className)}
            disabled={i === breadcrumbs.length - 1}
          />
          {i < breadcrumbs.length - 1 && (
            <FontAwesomeV6Icon iconName="chevron-right" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Breadcrumbs;
