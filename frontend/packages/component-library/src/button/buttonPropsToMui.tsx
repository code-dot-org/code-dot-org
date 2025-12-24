import {
  ButtonProps as MuiButtonProps,
  IconButtonProps as MuiIconButtonProps,
} from '@mui/material';

import {GenericButtonProps} from '@/button/GenericButton';
import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';

import {ButtonType, ButtonColor} from './types';

/**
 * Transforms current Button props to MUI Button/IconButton props.
 *
 * This is a temporary mapping function for comparison purposes.
 * Style overrides will be added later to match the design system exactly.
 */
export function buttonPropsToMui(props: GenericButtonProps): {
  isIconButton: boolean;
  buttonProps: Partial<MuiButtonProps>;
  iconButtonProps: Partial<MuiIconButtonProps>;
} {
  const {
    type = 'primary',
    color = 'purple',
    size = 'm',
    text,
    iconLeft,
    iconRight,
    isIconOnly = false,
    icon,
    disabled = false,
    isPending = false,
    ariaLabel,
    className,
    id,
    onClick,
    buttonTagTypeAttribute,
    forceHover,
    // Link props
    useAsLink,
    href,
    target,
    download,
    title,
    analyticsCallback,
    // Other HTML props
    ...rest
  } = props;

  // Map type to variant
  const variantMap: Record<ButtonType, MuiButtonProps['variant']> = {
    primary: 'contained',
    secondary: 'outlined',
    tertiary: 'text',
  };
  const variant = variantMap[type];

  // Map size (for now, map to closest MUI size - will be extended via theme later)
  const sizeMap: Record<string, 'extraSmall' | 'small' | 'medium' | 'large'> = {
    xs: 'extraSmall',
    s: 'small',
    m: 'medium',
    l: 'large',
  };
  const muiSize = sizeMap[size] || 'medium';

  // Map color (for now, use data attribute - will be extended via theme later)
  // MUI colors: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'inherit'
  const colorMap: Record<ButtonColor, MuiButtonProps['color']> = {
    purple: 'primary',
    black: 'secondary', // Will be custom color
    gray: 'tertiary', // Will be custom color
    white: 'white', // Will be custom color
    destructive: 'error',
  };
  const muiColor = colorMap[color] || 'primary';

  // Handle icon-only buttons with IconButton
  if (isIconOnly && icon) {
    return {
      isIconButton: true,
      buttonProps: {},
      iconButtonProps: {
        color: muiColor,
        size: muiSize,
        disabled: disabled || isPending,
        className: forceHover
          ? `${className || ''} force-hover`.trim()
          : className,
        id,
        onClick: analyticsCallback || onClick,
        'aria-label': ariaLabel || rest['aria-label'],
        // Set data attributes for theme overrides
        ...({'data-color': color} as Record<string, string>),
        ...({'data-type': type} as Record<string, string>), // Pass type for icon buttons
        ...(size && ({['data-size']: size} as Record<string, string>)),
        ...(forceHover &&
          ({'data-force-hover': true} as Record<string, boolean>)),
        ...rest,
      },
    };
  }

  // Regular button props
  const muiProps: Partial<MuiButtonProps> = {
    variant,
    color: muiColor,
    size: muiSize,
    disabled: disabled || isPending,
    // Note: loading prop may require LoadingButton from @mui/lab
    // For now, we'll use disabled state when pending
    // loading: isPending, // Uncomment when using LoadingButton
    className: forceHover ? `${className || ''} force-hover`.trim() : className,
    id,
    onClick: analyticsCallback || onClick,
    'aria-label': ariaLabel || rest['aria-label'],
    // Set data-color for all colors to enable theme overrides
    // Purple and destructive use MUI's primary/error, but we still set data-color for consistency
    ...({'data-color': color} as Record<string, string>),
    ...(size && ({['data-size']: size} as Record<string, string>)),
    ...(forceHover && ({'data-force-hover': true} as Record<string, boolean>)),
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

  // Handle icons
  if (iconLeft) {
    muiProps.startIcon = <FontAwesomeV6Icon {...iconLeft} />;
  }
  if (iconRight) {
    muiProps.endIcon = <FontAwesomeV6Icon {...iconRight} />;
  }

  // Handle children (text content)
  if (text) {
    muiProps.children = text;
  }

  return {
    isIconButton: false,
    buttonProps: muiProps,
    iconButtonProps: {},
  };
}
