/**
 * This file contains constants that are used across the component library
 */

import {VisualAppearance} from '@/typography';

import {ComponentSizeXSToL, DropdownColor} from '@/common/types';

export const componentSizes: Record<ComponentSizeXSToL, ComponentSizeXSToL> = {
  xs: 'xs',
  s: 's',
  m: 'm',
  l: 'l',
} as const;

/**
 *  This is the map of component size to body text size (visualAppearance)
 */
export const componentSizeToBodyTextSizeMap: Record<string, VisualAppearance> = {
  [componentSizes.l]: 'body-one',
  [componentSizes.m]: 'body-two',
  [componentSizes.s]: 'body-three',
  [componentSizes.xs]: 'body-four',
} as const;

export const dropdownColors: {[key in DropdownColor]: DropdownColor} = {
  white: 'white',
  black: 'black',
  gray: 'gray',
};
