/**
 * Explicit MUI Button/IconButton prop types with custom color and size values.
 *
 * These types exist because TypeScript module augmentations
 * (e.g., adding 'tertiary' to ButtonPropsColorOverrides) don't work
 * across package boundaries in this monorepo — apps/ and component-library
 * resolve @mui/material to different physical node_modules directories.
 * Components that accept button props in their public interfaces should
 * use these types instead of importing ButtonProps directly from @mui/material.
 */
import {
  ButtonProps as MuiButtonProps,
  IconButtonProps as MuiIconButtonProps,
} from '@mui/material';

/** MUI Button props with code.org custom color and size values */
export type ComponentLibraryButtonProps = Omit<
  MuiButtonProps,
  'color' | 'size'
> & {
  color?: 'primary' | 'secondary' | 'tertiary' | 'white' | 'error' | 'inherit';
  size?: 'extraSmall' | 'small' | 'medium' | 'large';
  /** Link target (when used with href) */
  target?: string;
  /** Link rel (when used with href) */
  rel?: string;
};

/** MUI IconButton props with code.org custom color and size values */
export type ComponentLibraryIconButtonProps = Omit<
  MuiIconButtonProps,
  'color' | 'size'
> & {
  color?:
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'white'
    | 'error'
    | 'inherit'
    | 'default';
  size?: 'extraSmall' | 'small' | 'medium' | 'large';
  variant?: 'contained' | 'outlined' | 'text';
};
