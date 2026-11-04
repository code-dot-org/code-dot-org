import {Divider} from '@mui/material';
import classNames from 'classnames';
import {HTMLAttributes} from 'react';

import {SpacingNoneToL} from '@/common/types';

import moduleStyles from './muiDivider.module.scss';

export interface MuiDividerProps
  extends Omit<HTMLAttributes<HTMLHRElement>, 'color' | 'children'> {
  /** Line color: `primary` (the default) or `strong`, the darker one. Mapped to a class; the `<hr>` gets no `color` attribute. */
  color?: 'primary' | 'strong';
  /** Space above and below the line: `none` (the default) 0, `xs` 0.5rem, `s` 1rem, `m` 2rem, `l` 4rem. The inline margin stays `auto`. */
  margin?: SpacingNoneToL;
  /** Class added to the `<hr>` after the wrapper's own. To override border, margin, width or flex-shrink, its rule needs two classes, or use `style`. */
  className?: string;
}

/**
 * ###  Status: ```Ready for dev```
 *
 * Design System: Divider on MUI `Divider`. Renders a horizontal `<hr>`, a
 * full-width 1px rule, to break up page or section content. For a vertical
 * or flex-item separator, use `Divider` from `@mui/material`.
 */
const MuiDivider: React.FunctionComponent<MuiDividerProps> = ({
  color = 'primary',
  margin = 'none',
  className,
  ...HTMLAttributes
}) => (
  <Divider
    className={classNames(
      moduleStyles.divider,
      moduleStyles[`divider-color-${color}`],
      moduleStyles[`divider-margin-${margin}`],
      className,
    )}
    {...HTMLAttributes}
  />
);

export default MuiDivider;
