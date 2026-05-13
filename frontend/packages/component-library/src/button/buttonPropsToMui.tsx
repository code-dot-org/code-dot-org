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
  const {variant, muiSize, muiColor, baseProps} = core;

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

  // Regular button props - start with base props from core.
  // baseProps already includes loading: isPending and loadingPosition, so MUI's native
  // loading machinery handles showing the spinner and managing icon/text visibility.
  const muiProps: Partial<MuiButtonProps> = {
    ...baseProps,
    variant,
    color: muiColor,
    size: muiSize,
  };

  if (iconLeft) {
    muiProps.startIcon = <FontAwesomeV6Icon {...iconLeft} />;
  }
  if (iconRight) {
    muiProps.endIcon = <FontAwesomeV6Icon {...iconRight} />;
  }

  if (text) {
    muiProps.children = text;
  }

  return {
    isIconButton: false,
    buttonProps: muiProps,
    iconButtonProps: {},
    isPending,
  };
}
