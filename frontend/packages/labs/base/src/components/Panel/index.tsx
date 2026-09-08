import classNames from 'classnames';
import type {PropsWithChildren, ComponentProps} from 'react';

import moduleStyles from './panel.module.scss';

export type PanelProps = PropsWithChildren &
  ComponentProps<'div'> & {
    /** Reverses the layout of the page */
    reverse?: boolean;
  };

/**
 * This represents a vertical stretch across a lab interface.
 *
 * It should contain either PanelContainers, which are flexed across, and/or a
 * ResourcePanel which should be listed as the first child.
 *
 * The Panel component should itself be included within a Layout component.
 */
const Panel = ({children, reverse, className, ...props}: PanelProps) => (
  <div
    {...props}
    className={classNames(
      className,
      moduleStyles.panel,
      reverse ? moduleStyles.reverse : undefined,
    )}
  >
    {children}
  </div>
);

export default Panel;
