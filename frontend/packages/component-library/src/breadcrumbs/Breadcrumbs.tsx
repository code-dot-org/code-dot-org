import classNames from 'classnames';
import {Fragment} from 'react';

import {ComponentSizeXSToL} from '@/common/types';
import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';
import Link, {LinkWithText} from '@/link';

import moduleStyles from './breadcrumbs.module.scss';

export interface BreadcrumbsProps {
  /** List of Breadcrumbs to render */
  breadcrumbs: LinkWithText[];
  /** Breadcrumbs name */
  name: string;
  /** Size of Breadcrumbs */
  size?: ComponentSizeXSToL;
  /** Custom className */
  className?: string;
  /** Whether to show the home icon at the start */
  showHomeIcon?: boolean;
}

/**
 * ### Production-ready Checklist:
 * * (✔) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✔) has tests: test every prop, every state and every interaction that's js related;
 * * (see ./__tests__/Breadcrumbs.test.tsx)
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
  showHomeIcon = false,
}) => {
  return (
    <div
      className={classNames(
        moduleStyles.breadcrumbs,
        moduleStyles[`breadcrumbs-${size}`],
        className,
      )}
      // TODO [Design2-197] - Create a visual test for this case instead of checking for class name

      data-testid={`breadcrumbs-${name}`}
    >
      {showHomeIcon && (
        <>
          <Link href="/" className={moduleStyles.breadcrumb}>
            <FontAwesomeV6Icon
              iconName="house"
              className={moduleStyles.homeIcon}
              title="Home"
            />
          </Link>
          <FontAwesomeV6Icon iconName="chevron-right" />
        </>
      )}
      {breadcrumbs.map(({text, href, ...rest}, i) => (
        <Fragment key={`${text}-${href}`}>
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
        </Fragment>
      ))}
    </div>
  );
};

export default Breadcrumbs;
