import classNames from 'classnames';
import {Fragment} from 'react';

import {ComponentSizeXSToL} from '@/common/types';
import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';
import Link, {LinkProps} from '@/link';

import moduleStyles from './breadcrumbs.module.scss';

export interface BreadcrumbsProps {
  /** List of Breadcrumbs to render */
  breadcrumbs: LinkProps[];
  /** Breadcrumbs name */
  name: string;
  /** Size of Breadcrumbs */
  size?: ComponentSizeXSToL;
  /** Custom className */
  className?: string;
  /** Whether to show the home icon at the start */
  showHomeIcon?: boolean;
  /** Home icon link */
  homeIconHref?: string;
}

/**
 * ### Production-ready Checklist:
 * * (✔) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✔) has tests: test every prop, every state and every interaction that's js related;
 * * (see ./__tests__/Breadcrumbs.test.tsx)
 * * (?) passes accessibility checks;
 *
 * ### Status: ```DEPRECATED```
 *
 * @deprecated Use MUI `Breadcrumbs` from `@mui/material` instead.
 * Style overrides are in `src/themes/code.org/styleOverrides/breadcrumbs.ts`.
 * Custom size prop augmented (`xs`, `s`, `m`, `l`).
 */
const Breadcrumbs: React.FunctionComponent<BreadcrumbsProps> = ({
  breadcrumbs,
  name,
  size = 'm',
  className,
  showHomeIcon = false,
  homeIconHref = '/',
}) => {
  return (
    <div
      className={classNames(
        moduleStyles.breadcrumbs,
        moduleStyles[`breadcrumbs-${size}`],
        className,
      )}
      data-testid={`breadcrumbs-${name}`}
    >
      {showHomeIcon && (
        <>
          <Link href={homeIconHref} className={moduleStyles.breadcrumb}>
            <FontAwesomeV6Icon
              iconName="house"
              className={moduleStyles.homeIcon}
              title="Home"
            />
          </Link>
          <FontAwesomeV6Icon iconName="chevron-right" />
        </>
      )}
      {breadcrumbs.map(({href, ...rest}, i) => (
        <Fragment key={href}>
          <Link
            {...rest}
            href={href}
            className={classNames(moduleStyles.breadcrumb, rest.className)}
            disabled={i === breadcrumbs.length - 1}
          />
          {i < breadcrumbs.length - 1 && (
            <FontAwesomeV6Icon iconName="chevron-right" />
          )}
        </Fragment>
      ))}
    </div>
  );
};

export default Breadcrumbs;
