import React, {memo} from 'react';

import {ComponentSizeXSToL} from '@cdo/apps/componentLibrary/common/types';
import {FontAwesomeV6IconProps} from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';

import _BaseButton from './_baseButton/_BaseButton';
import {ButtonType, ButtonColor} from './types';

export const buttonColors: {[key in ButtonColor]: ButtonColor} = {
  purple: 'purple',
  black: 'black',
  white: 'white',
};

export interface ButtonProps {
  /** Button Component type */
  type?: ButtonType;
  /** Custom class name */
  className?: string;
  /** Button id */
  id?: string;
  /** Button color */
  color?: ButtonColor;
  /** Button text */
  text?: string;
  /** Is button disabled */
  disabled?: boolean;
  /** Is button pending */
  isPending?: boolean;
  /** Button aria-label */
  ariaLabel?: string;
  /** Size of button */
  size?: ComponentSizeXSToL;
  /** Left Button icon */
  iconLeft?: FontAwesomeV6IconProps;
  /** Button icon (When used in IconOnly mode)*/
  icon?: FontAwesomeV6IconProps;
  /** Left Button icon */
  iconRight?: FontAwesomeV6IconProps;
  /** (\<button> specific prop)
   * Button html element type */
  buttonType?: 'submit' | 'button';
  /** (\<button> specific prop)
   *  Button onClick */
  onClick?: (
    event:
      | React.MouseEvent<HTMLButtonElement>
      // This is a workaround to fix TS error not allowing us to use Tag and tagSpecificProps logic.
      //   onClick Should only be applied to <button> elements, but not to <a> elements.
      | React.MouseEvent<HTMLAnchorElement>
  ) => void;
  /** (\<button> specific prop)
   *  Button value */
  value?: string;
  /** (\<button> specific prop)
   *  Button name */
  name?: string;
}

const Button: React.FunctionComponent<ButtonProps> = props => (
  <_BaseButton {...props} />
);

/**
 * ###  Status: ```Ready for dev```
 *
 * Design System: Link Button Component.
 *
 * Alias for ***_BaseButton*** Component. Renders a Button with <a> tag.
 *
 * Can be used to render a button or as a part of bigger/more complex components (e.g. Some forms, blocks/cards).
 */
export default memo(Button);
