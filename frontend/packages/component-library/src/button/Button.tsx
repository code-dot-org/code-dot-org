import {forwardRef, memo} from 'react';

import GenericButton, {
  CoreButtonProps,
  ButtonSpecificProps,
} from './GenericButton';
import {ButtonColor} from './types';

export const buttonColors: {[key in ButtonColor]: ButtonColor} = {
  purple: 'purple',
  black: 'black',
  gray: 'gray',
  white: 'white',
  destructive: 'destructive',
};

export interface ButtonProps extends CoreButtonProps, ButtonSpecificProps {}

const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (props, ref) => <GenericButton ref={ref} {...props} />,
);

/**
 * ###  Status: ```DEPRECATED```
 *
 * @deprecated Use MUI `Button` from `@mui/material` instead.
 * Style overrides are in `src/themes/code.org/styleOverrides/button.tsx`.
 * See `src/button/BUTTON_MIGRATION_TO_MUI.md` for migration guide.
 * Codemod available: `yarn codemod:buttons`.
 */
export default memo(Button);
