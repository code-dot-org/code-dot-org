/**
 * This file contains constants that are used across the component library
 */

import {ComponentSizeXSToL, DropdownColor} from '@/common/types';
import {FontAwesomeV6IconProps} from '@/fontAwesomeV6Icon';

/** MUI Typography body variants used for component label/copy sizing */
export type BodyTextSizeVariant = 'body1' | 'body2' | 'body3' | 'body4';

/**
 * Map of component size to body text size (MUI Typography variant).
 * Use with <Typography variant={componentSizeToBodyTextSizeMap[size]} />.
 */
export const componentSizeToBodyTextSizeMap: {
  [key in ComponentSizeXSToL]: BodyTextSizeVariant;
} = {
  l: 'body1',
  m: 'body2',
  s: 'body3',
  xs: 'body4',
};

export const dropdownColors: {[key in DropdownColor]: DropdownColor} = {
  white: 'white',
  black: 'black',
  gray: 'gray',
};

export const externalLinkIconProps: FontAwesomeV6IconProps = {
  iconName: 'up-right-from-square',
  iconStyle: 'solid',
};
