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
  isPending?: boolean;
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

  // Map color to MUI color prop
  // MUI colors: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'inherit' | 'white' | 'tertiary'
  const colorMap: Record<ButtonColor, MuiButtonProps['color']> = {
    purple: 'primary',
    black: 'secondary',
    gray: 'tertiary',
    white: 'white',
    destructive: 'error',
  };
  const muiColor = colorMap[color] || 'primary';

  // Handle icon-only buttons with IconButton
  if (isIconOnly && icon) {
    return {
      isIconButton: true,
      buttonProps: {},
      iconButtonProps: {
        variant,
        color: muiColor,
        size: muiSize,
        disabled: disabled,
        className: forceHover
          ? `${className || ''} force-hover`.trim()
          : className,
        id,
        onClick: analyticsCallback || onClick,
        'aria-label': ariaLabel || rest['aria-label'],
        // Keep data-force-hover for backwards compatibility
        ...(forceHover &&
          ({'data-force-hover': true} as Record<string, boolean>)),
        ...rest,
      } as Partial<MuiIconButtonProps>,
      isPending,
    };
  }

  // Regular button props
  const muiProps: Partial<MuiButtonProps> = {
    variant,
    color: muiColor,
    size: muiSize,
    disabled: disabled,
    // Note: loading prop may require LoadingButton from @mui/lab
    // For now, we'll use disabled state when pending
    // loading: isPending, // Uncomment when using LoadingButton
    className: forceHover ? `${className || ''} force-hover`.trim() : className,
    id,
    onClick: analyticsCallback || onClick,
    'aria-label': ariaLabel || rest['aria-label'],
    // Keep data-force-hover for backwards compatibility
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

  // Handle pending state with spinner icon
  // Spinner logic matches original Button component:
  // - If there's only text - show only spinner (text is hidden but keeps space)
  // - If there's only icon - show only spinner
  // - If there's text and iconLeft or both iconLeft and iconRight -> spinner on the left + text + iconRight
  // - If there's text and iconRight (but no iconLeft) -> text + spinner on the right
  const spinnerIcon = {
    iconName: 'spinner' as const,
    iconStyle: 'solid' as const,
    animationType: 'spin' as const,
  };
  const spinnerPosition = iconRight && !iconLeft ? 'right' : 'left';
  const addPendingButtonWithHiddenTextClass =
    isPending && !icon && !iconLeft && !iconRight;

  // Handle icons (hide iconLeft when pending, show iconRight only if not pending or if both icons exist)
  if (isPending) {
    if (addPendingButtonWithHiddenTextClass) {
      // When pending with only text (no icons), spinner should be centered
      // We'll use startIcon but add className for CSS to center it absolutely
      muiProps.startIcon = <FontAwesomeV6Icon {...spinnerIcon} />;
    } else {
      // When pending with icons, show spinner in appropriate position
      // When pending, show spinner instead of iconLeft
      if (spinnerPosition === 'left') {
        muiProps.startIcon = <FontAwesomeV6Icon {...spinnerIcon} />;
      }
      // Show iconRight only if both iconLeft and iconRight exist (per original logic)
      if (iconRight && iconLeft) {
        muiProps.endIcon = <FontAwesomeV6Icon {...iconRight} />;
      } else if (spinnerPosition === 'right') {
        muiProps.endIcon = <FontAwesomeV6Icon {...spinnerIcon} />;
      }
    }
  } else {
    // Normal state: show icons as usual
    if (iconLeft) {
      muiProps.startIcon = <FontAwesomeV6Icon {...iconLeft} />;
    }
    if (iconRight) {
      muiProps.endIcon = <FontAwesomeV6Icon {...iconRight} />;
    }
  }

  // Handle children (text content)
  // When pending with no icons, text should be hidden but still present for spacing
  if (text) {
    if (addPendingButtonWithHiddenTextClass) {
      // Hide text but keep it in DOM for spacing, spinner will be centered
      muiProps.children = <span style={{visibility: 'hidden'}}>{text}</span>;
    } else {
      muiProps.children = text;
    }
  }

  // Add className for pending state with hidden text to enable proper styling
  if (addPendingButtonWithHiddenTextClass) {
    const existingClassName = muiProps.className || '';
    muiProps.className = existingClassName
      ? `${existingClassName} buttonPendingWithHiddenText`
      : 'buttonPendingWithHiddenText';
  }

  return {
    isIconButton: false,
    buttonProps: muiProps,
    iconButtonProps: {},
    isPending,
  };
}
