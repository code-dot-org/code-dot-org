/**
 * JavaScript version of buttonPropsToMui for use in codemods
 * Replicates the logic from frontend/packages/component-library/src/button/buttonPropsToMui.tsx
 */

// Map type to variant
const variantMap = {
  primary: 'contained',
  secondary: 'outlined',
  tertiary: 'text',
};

// Map size
const sizeMap = {
  xs: 'extraSmall',
  s: 'small',
  m: 'medium',
  l: 'large',
};

// Map color
const colorMap = {
  purple: 'primary',
  black: 'secondary',
  gray: 'tertiary',
  white: 'white',
  destructive: 'error',
};

/**
 * Transforms Button props to MUI Button/IconButton props
 * @param {Object} props - Button props
 * @returns {Object} - {isIconButton, buttonProps, iconButtonProps, isPending}
 */
function buttonPropsToMui(props) {
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
    useAsLink,
    href,
    target,
    download,
    title,
    analyticsCallback,
    ...rest
  } = props;

  const variant = variantMap[type] || 'contained';
  const muiSize = sizeMap[size] || 'medium';
  const muiColor = colorMap[color] || 'primary';

  // Create onClick handler that calls both analyticsCallback and onClick
  const handleClick = analyticsCallback
    ? (event) => {
        analyticsCallback();
        if (onClick) onClick(event);
      }
    : onClick;

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
        onClick: handleClick,
        'aria-label': ariaLabel || rest['aria-label'],
        ...(forceHover && {'data-force-hover': true}),
        ...rest,
      },
      isPending,
      icon, // Pass icon for rendering
    };
  }

  // Regular button props
  const muiProps = {
    variant,
    color: muiColor,
    size: muiSize,
    disabled: disabled,
    className: forceHover ? `${className || ''} force-hover`.trim() : className,
    id,
    onClick: handleClick,
    'aria-label': ariaLabel || rest['aria-label'],
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

  // Handle pending state with spinner icon
  const spinnerIcon = {
    iconName: 'spinner',
    iconStyle: 'solid',
    animationType: 'spin',
  };
  const spinnerPosition = iconRight && !iconLeft ? 'right' : 'left';
  const addPendingButtonWithHiddenTextClass =
    isPending && !icon && !iconLeft && !iconRight;

  // Handle icons (hide iconLeft when pending, show iconRight only if not pending or if both icons exist)
  if (isPending) {
    if (addPendingButtonWithHiddenTextClass) {
      muiProps.startIcon = spinnerIcon;
      muiProps._pendingWithHiddenText = true;
    } else {
      if (spinnerPosition === 'left') {
        muiProps.startIcon = spinnerIcon;
      }
      if (iconRight && iconLeft) {
        muiProps.endIcon = iconRight;
      } else if (spinnerPosition === 'right') {
        muiProps.endIcon = spinnerIcon;
      }
    }
  } else {
    if (iconLeft) {
      muiProps.startIcon = iconLeft;
    }
    if (iconRight) {
      muiProps.endIcon = iconRight;
    }
  }

  // Handle children (text content)
  if (text) {
    if (addPendingButtonWithHiddenTextClass) {
      muiProps.children = text;
      muiProps._hiddenText = true;
    } else {
      muiProps.children = text;
    }
  }

  // Add className for pending state with hidden text
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

module.exports = {buttonPropsToMui};

