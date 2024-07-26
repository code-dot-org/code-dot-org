import React, {memo} from 'react';

import _BaseButton, {
  CoreButtonProps,
  ButtonSpecificProps,
} from './_baseButton/_BaseButton';
import {ButtonColor} from './types';

export const buttonColors: {[key in ButtonColor]: ButtonColor} = {
  purple: 'purple',
  black: 'black',
  gray: 'gray',
  white: 'white',
  destructive: 'destructive',
};

export interface ButtonProps extends CoreButtonProps, ButtonSpecificProps {}

const Button: React.FunctionComponent<ButtonProps> = props => (
  <_BaseButton {...props} />
);

/**
 * ###  Status: ```Ready for dev```
 *
 * Design System: Link Button Component.
 *
 * Alias for ***_BaseButton*** Component. Renders a Button with ```<button>``` html tag.
 *
 * Can be used to render a button or as a part of bigger/more complex components (e.g. Some forms, blocks/cards).
 */
export default memo(Button);
