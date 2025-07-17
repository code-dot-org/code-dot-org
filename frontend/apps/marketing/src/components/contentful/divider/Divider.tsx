import MUIDivider from '@mui/material/Divider';
import React, {HTMLAttributes} from 'react';

import type {SpacingProps} from '@/components/common/types';

export type DividerProps = HTMLAttributes<HTMLElement> & {
  /** Divider color */
  color?: 'primary' | 'strong';
  /** Divider margin */
  margin?: keyof SpacingProps;
  /** Divider custom className */
  className?: string;
};

// Map SpacingProps keys to MUI spacing values
const spacingMap: Record<keyof SpacingProps, number> = {
  none: 0, // 0px
  xs: 1, // 8px
  s: 2, // 16px
  m: 4, // 32px
  l: 8, // 64px
};

// Get the color value based on the provided color prop
const getColorValue = (color: DividerProps['color']) => {
  switch (color) {
    case 'strong':
      return 'var(--background-neutral-senary)'; // TODO: Replace with MUI theme color
    case 'primary':
    default:
      return 'var(--background-neutral-quaternary)'; // TODO: Replace with MUI theme color
  }
};

const Divider: React.FC<DividerProps> = ({
  color = 'primary',
  margin = 'm',
  className,
}) => {
  return (
    <MUIDivider
      className={className}
      orientation="horizontal"
      variant="fullWidth"
      sx={theme => ({
        marginTop: theme.spacing(spacingMap[margin]),
        marginBottom: theme.spacing(spacingMap[margin]),
        backgroundColor: getColorValue(color),
      })}
      flexItem
    />
  );
};

export default Divider;
