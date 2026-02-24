import {
  ButtonProps as MuiButtonProps,
  IconButtonProps as MuiIconButtonProps,
} from '@mui/material';

import {GenericButtonProps} from '@/button/GenericButton';
import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';

import {transformButtonPropsCore} from './buttonPropsToMuiCore';

/**
 * Transforms current Button props to MUI Button/IconButton props.
 *
 * This function uses the shared `transformButtonPropsCore` logic to compute
 * MUI variant/color/size and base props, then adds JSX rendering for icons and children.
 */
export function buttonPropsToMui(props: GenericButtonProps): {
  isIconButton: boolean;
  buttonProps: Partial<MuiButtonProps>;
  iconButtonProps: Partial<MuiIconButtonProps>;
  isPending?: boolean;
} {
  const {
    text,
    iconLeft,
    iconRight,
    isIconOnly = false,
    icon,
    isPending = false,
  } = props;

  // Use shared core logic for prop transformation
  const core = transformButtonPropsCore(props);
  const {
    variant,
    muiSize,
    muiColor,
    baseProps,
    spinnerIcon,
    spinnerPosition,
    addPendingButtonWithHiddenTextClass,
  } = core;

  // Handle icon-only buttons with IconButton
  if (isIconOnly && icon) {
    return {
      isIconButton: true,
      buttonProps: {},
      iconButtonProps: {
        ...baseProps,
        variant,
        color: muiColor,
        size: muiSize,
      } as Partial<MuiIconButtonProps>,
      isPending,
    };
  }

  // Regular button props - start with base props from core
  const muiProps: Partial<MuiButtonProps> = {
    ...baseProps,
    variant,
    color: muiColor,
    size: muiSize,
    // Note: MUI Button has a loading prop, but it's styled differently from DSCO designs.
    // This is why we use a custom implementation with spinner icon (see below).
    // If a solution to customize MUI Button's native loading state styles is found, we can update it.
  };

  // Handle pending state with spinner icon
  // Note: MUI Button has a loading prop, but it's styled differently from DSCO designs.
  // This is why we currently use a custom implementation with spinner icon.
  // If a solution to customize MUI Button's native loading state styles is found, we can update it.
  // Spinner logic matches original Button component:
  // - If there's only text - show only spinner (text is hidden but keeps space)
  // - If there's only icon - show only spinner
  // - If there's text and iconLeft or both iconLeft and iconRight -> spinner on the left + text + iconRight
  // - If there's text and iconRight (but no iconLeft) -> text + spinner on the right
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
