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
    text,
    iconLeft,
    iconRight,
    isIconOnly = false,
    icon,
    isPending = false,
  } = props;

  // Use shared core transformation logic
  const {
    baseProps,
    spinnerIcon,
    spinnerPosition,
    addPendingButtonWithHiddenTextClass,
  } = transformButtonPropsCore(
    props as Parameters<typeof transformButtonPropsCore>[0],
  );

  // Handle icon-only buttons with IconButton
  if (isIconOnly && icon) {
    return {
      isIconButton: true,
      buttonProps: {},
      iconButtonProps: {
        ...baseProps,
      } as Partial<MuiIconButtonProps>,
      isPending,
    };
  }

  // Regular button props - start with base props from core
  const muiProps: Partial<MuiButtonProps> = {
    ...baseProps,
  };

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
