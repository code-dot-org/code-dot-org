import classNames from 'classnames';
import {HTMLAttributes} from 'react';

import {SpacingNoneToL} from './../common/types';

import moduleStyles from './divider.module.scss';

/**
 * @deprecated Use `MuiDividerProps` from `@code-dot-org/component-library/divider`.
 * Codemod: `codemods/divider-to-mui-divider.ts` in `frontend/packages/component-library`.
 */
export interface DividerProps extends HTMLAttributes<HTMLElement> {
  /** Divider Color */
  color?: 'primary' | 'strong';
  /** Divider Margin */
  margin?: SpacingNoneToL;
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
 *
 * @deprecated Use `MuiDivider` from `@code-dot-org/component-library/divider`; it takes the same props.
 * Codemod: `codemods/divider-to-mui-divider.ts` in `frontend/packages/component-library`.
 * See `src/divider/DIVIDER_MIGRATION_TO_MUI.md`.
 */

const Divider: React.FC<DividerProps> = ({
  color = 'primary',
  margin = 'none',
  className,
  ...HTMLAttributes
}: DividerProps) => (
  <hr
    className={classNames(
      moduleStyles.divider,
      moduleStyles[`divider-color-${color}`],
      moduleStyles[`divider-margin-${margin}`],
      className,
    )}
    {...HTMLAttributes}
  />
);

export default Divider;
