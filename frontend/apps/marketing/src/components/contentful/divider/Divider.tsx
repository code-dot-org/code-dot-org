import MuiDivider from '@mui/material/Divider';
import classNames from 'classnames';
import React, {HTMLAttributes} from 'react';

import type {SpacingProps} from '@/components/common/types';

export type DividerProps = HTMLAttributes<HTMLElement> & {
  /** Divider color */
  color?: 'primary' | 'strong' | 'white';
  /** Divider margin */
  margin?: keyof SpacingProps;
  /** Divider custom className */
  className?: string;
};

const Divider: React.FC<DividerProps> = ({
  color = 'primary',
  margin = 'm',
  className,
}) => {
  return (
    <MuiDivider
      className={classNames(
        `divider--color-${color}`,
        `divider--margin-${margin}`,
        className,
      )}
      orientation="horizontal"
      variant="fullWidth"
      flexItem
    />
  );
};

export default Divider;
