import type {ChipProps as MuiChipProps} from '@mui/material/Chip';

import type {ComponentSizeXSToL} from '@/common/types';

export type TagSize =
  | Exclude<ComponentSizeXSToL, 'xs'>
  | 'small'
  | 'medium'
  | 'large';
export type TagVariant = 'light' | 'solid' | 'filled' | 'outlined';
export type TagColor =
  | 'teal'
  | 'purple'
  | 'aqua'
  | 'error'
  | 'warning'
  | 'success'
  | 'gray'
  | 'disabled';

export interface TagPropsToMuiCoreInput {
  size?: TagSize;
  variant?: TagVariant;
  color?: TagColor;
  disabled?: boolean;
  className?: string;
  id?: string;
  [key: string]: unknown;
}

export interface TagPropsToMuiCoreOutput {
  size: MuiChipProps['size'] | 'large';
  variant: 'light' | 'solid';
  color: MuiChipProps['color'];
  disabled: boolean;
  className?: string;
  id?: string;
}

const sizeMap: Record<string, MuiChipProps['size'] | 'large'> = {
  s: 'small',
  m: 'medium',
  l: 'large',
  small: 'small',
  medium: 'medium',
  large: 'large',
};

const variantMap: Record<TagVariant, 'light' | 'solid'> = {
  light: 'light',
  solid: 'solid',
  filled: 'solid',
  outlined: 'light',
};

const colorMap: Record<TagColor, MuiChipProps['color']> = {
  teal: 'teal',
  purple: 'purple',
  aqua: 'aqua',
  error: 'error',
  warning: 'warning',
  success: 'success',
  gray: 'gray',
  disabled: 'disabled',
};

export function transformTagPropsCore(
  props: TagPropsToMuiCoreInput,
): TagPropsToMuiCoreOutput {
  const {
    size = 'm',
    variant = 'light',
    color = 'teal',
    disabled = false,
    className,
    id,
  } = props;

  const mappedVariant = variantMap[variant] || 'light';
  const mappedSize = sizeMap[size] || 'medium';
  const mappedColor = colorMap[color] || 'teal';
  const resolvedDisabled = disabled || color === 'disabled';

  return {
    variant: mappedVariant,
    size: mappedSize,
    color: mappedColor,
    disabled: resolvedDisabled,
    className,
    id,
  };
}
