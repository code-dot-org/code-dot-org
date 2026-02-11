import classNames from 'classnames';
import type {PropsWithChildren, ComponentProps} from 'react';

import moduleStyles from './layout.module.scss';

export type LayoutProps = PropsWithChildren &
  ComponentProps<'div'> & {
    /** Reverses the layout of the page */
    reverse?: boolean;
    /**
     * Whether or not the layout should fill the screen leaving responsibility
     * of scrolling and other accommodations to happen inside panels instead.
     *
     * Defaults to 'true'
     */
    full?: boolean;
  };

/**
 * This represents the container for a lab layout.
 *
 * It should contain Panel components to subdivide the area vertically. It is
 * possible that the lab just has a single Panel.
 *
 * A ResourcePanel, if desired, should be placed inside the first Panel as the
 * first child.
 */
const Layout = ({
  children,
  reverse,
  full,
  className,
  ...props
}: LayoutProps) => (
  <div
    {...props}
    className={classNames(
      className,
      moduleStyles.layout,
      full !== false ? moduleStyles.full : undefined,
      reverse ? moduleStyles.reverse : undefined,
    )}
  >
    {children}
  </div>
);

export default Layout;
