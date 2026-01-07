/**
 * Core prop transformation logic for buttonPropsToMui
 * Shared between buttonPropsToMui.tsx and codemods/button-to-mui-button.ts
 */
import {ButtonProps as MuiButtonProps} from '@mui/material';

import {GenericButtonProps} from './GenericButton';
import {ButtonType, ButtonColor} from './types';

// Map type to variant
export const variantMap: Record<ButtonType, MuiButtonProps['variant']> = {
  primary: 'contained',
  secondary: 'outlined',
  tertiary: 'text',
};

// Map size
export const sizeMap: Record<
  string,
  'extraSmall' | 'small' | 'medium' | 'large'
> = {
  xs: 'extraSmall',
  s: 'small',
  m: 'medium',
  l: 'large',
};

// Map color to MUI color prop
export const colorMap: Record<ButtonColor, MuiButtonProps['color']> = {
  purple: 'primary',
  black: 'secondary',
  gray: 'tertiary',
  white: 'white',
  destructive: 'error',
};

export interface ButtonPropsToMuiCoreInput {
  type?: string;
  color?: string;
  size?: string;
  text?: React.ReactNode;
  iconLeft?: {iconName: string; iconStyle?: string; animationType?: string};
  iconRight?: {iconName: string; iconStyle?: string; animationType?: string};
  isIconOnly?: boolean;
  icon?: {iconName: string; iconStyle?: string; animationType?: string};
  disabled?: boolean;
  isPending?: boolean;
  ariaLabel?: string;
  className?: string;
  id?: string;
  onClick?: (
    event:
      | React.MouseEvent<HTMLButtonElement>
      | React.MouseEvent<HTMLAnchorElement>,
  ) => void;
  buttonTagTypeAttribute?: 'button' | 'submit' | 'reset';
  forceHover?: boolean;
  useAsLink?: boolean;
  href?: string;
  target?: string;
  download?: string | boolean;
  title?: string;
  analyticsCallback?: () => void;
  [key: string]: unknown;
}

export interface ButtonPropsToMuiCoreOutput {
  variant: MuiButtonProps['variant'];
  color: MuiButtonProps['color'];
  size: 'extraSmall' | 'small' | 'medium' | 'large';
  disabled: boolean;
  className?: string;
  id?: string;
  onClick?: (
    event:
      | React.MouseEvent<HTMLButtonElement>
      | React.MouseEvent<HTMLAnchorElement>,
  ) => void;
  'aria-label'?: string;
  'data-force-hover'?: boolean;
  href?: string;
  target?: string;
  download?: string | boolean;
  title?: string;
  rel?: string;
  type?: 'button' | 'submit' | 'reset';
  [key: string]: unknown;
}

/**
 * Core prop transformation logic (without JSX rendering)
 * Returns plain objects that can be used to construct MUI props
 */
export function transformButtonPropsCore(
  props: GenericButtonProps | ButtonPropsToMuiCoreInput,
): {
  variant: MuiButtonProps['variant'];
  muiSize: 'extraSmall' | 'small' | 'medium' | 'large';
  muiColor: MuiButtonProps['color'];
  handleClick?: (
    event:
      | React.MouseEvent<HTMLButtonElement>
      | React.MouseEvent<HTMLAnchorElement>,
  ) => void;
  baseProps: ButtonPropsToMuiCoreOutput;
  spinnerIcon: {iconName: 'spinner'; iconStyle: 'solid'; animationType: 'spin'};
  spinnerPosition: 'left' | 'right';
  addPendingButtonWithHiddenTextClass: boolean;
} {
  const {
    type = 'primary',
    color = 'purple',
    size = 'm',
    disabled = false,
    isPending = false,
    ariaLabel,
    className,
    id,
    onClick,
    buttonTagTypeAttribute,
    forceHover,
    useAsLink,
    href,
    target,
    download,
    title,
    analyticsCallback,
    iconLeft,
    iconRight,
    icon,
    ...rest
  } = props;

  const variant = variantMap[type as ButtonType] || 'contained';
  const muiSize = sizeMap[size] || 'medium';
  const muiColor = colorMap[color as ButtonColor] || 'primary';

  // Create onClick handler that calls both analyticsCallback and onClick
  const handleClick = analyticsCallback
    ? (
        event:
          | React.MouseEvent<HTMLButtonElement>
          | React.MouseEvent<HTMLAnchorElement>,
      ) => {
        analyticsCallback();
        onClick?.(event);
      }
    : onClick;

  // Base props (without icons and children, which are handled separately)
  const baseProps: ButtonPropsToMuiCoreOutput = {
    variant,
    color: muiColor,
    size: muiSize,
    disabled: disabled,
    className: forceHover ? `${className || ''} force-hover`.trim() : className,
    id,
    onClick: handleClick,
    'aria-label': ariaLabel || (rest['aria-label'] as string | undefined),
    ...(forceHover && {'data-force-hover': true}),
    // Link behavior
    ...(useAsLink &&
      href && {
        href: disabled ? undefined : href,
        target,
        download,
        title,
        rel: target === '_blank' ? 'noopener noreferrer' : undefined,
      }),
    // Button-specific props
    ...(!useAsLink && {
      type: buttonTagTypeAttribute || 'button',
    }),
    ...rest,
  };

  // Spinner icon definition
  const spinnerIcon = {
    iconName: 'spinner' as const,
    iconStyle: 'solid' as const,
    animationType: 'spin' as const,
  };

  const spinnerPosition = iconRight && !iconLeft ? 'right' : 'left';
  const addPendingButtonWithHiddenTextClass =
    isPending && !icon && !iconLeft && !iconRight;

  return {
    variant,
    muiSize,
    muiColor,
    handleClick,
    baseProps,
    spinnerIcon,
    spinnerPosition,
    addPendingButtonWithHiddenTextClass,
  };
}
