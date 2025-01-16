import classNames from 'classnames';
import {HTMLAttributes} from 'react';

import {ComponentSizeXSToL} from './../common/types';
import moduleStyles from './divider.module.scss';

export interface DividerProps extends HTMLAttributes<HTMLElement> {
  /** Divider Color */
  color?: 'primary' | 'strong';
  /** Divider Margin */
  margin?: 'none' | ComponentSizeXSToL;
  /** Divider custom className */
  className?: string;
}

/**
 * ### Production-ready Checklist:
 * * (✔) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✔) has tests: test every prop, every state and every interaction that's js related;
 * * (see ./__tests__/Divider.test.tsx)
 * * (✔) passes accessibility checks;
 *
 * ###  Status: ```Ready for Dev```
 *
 * Design System: Divider Component.
 * Used to render a section divider line. Can be used to break up the page or section content.
 */

export const Divider: React.FC<DividerProps> = ({
  color = 'primary',
  margin = 'none',
  className,
}: DividerProps) => (
  <hr
    className={classNames(
      moduleStyles.divider,
      moduleStyles[`divider-${color}`],
      moduleStyles[`divider-${margin}`],
      className,
    )}
  />
);
