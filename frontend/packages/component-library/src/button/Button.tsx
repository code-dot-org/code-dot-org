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
 * ###  Status: ```Ready for dev```
 *
 * Design System: Link Button Component.
 *
 * Alias for ***GenericButton*** Component. Renders a Button with ```<button>``` html tag.
 *
 * Can be used to render a button or as a part of bigger/more complex components (e.g. Some forms, blocks/cards).
 */
export default memo(Button);
