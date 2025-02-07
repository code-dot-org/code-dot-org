import {FontAwesomeV6IconProps} from '@/fontAwesomeV6Icon';

/**
 * Possible sizes for most(!) of Design System components
 */
export type ComponentSizeXSToL = 'xs' | 's' | 'm' | 'l';

/**
 * Possible colors for the dropdown components
 */
export type DropdownColor = 'white' | 'black' | 'gray';

/**
 * Possible component placement directions relative to target/connected element.
 * (Used for Tooltips, Popover, etc.)
 */
export type ComponentPlacementDirection =
  | 'onTop'
  | 'onRight'
  | 'onBottom'
  | 'onLeft';

export interface DropdownFormFieldRelatedProps {
  /** Dropdown helper message */
  helperMessage?: string;
  /** Dropdown helper icon */
  helperIcon?: FontAwesomeV6IconProps;
  /** Dropdown error message */
  errorMessage?: string;
  /** Style Dropdown as a form field */
  styleAsFormField?: boolean;
}
