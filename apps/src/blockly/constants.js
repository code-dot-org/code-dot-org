import {makeEnum} from '@cdo/apps/utils';

export const ToolboxType = makeEnum('CATEGORIZED', 'UNCATEGORIZED', 'NONE');

// Used for custom field type ClampedNumber(,)
// Captures two optional arguments from the type string
// Allows:
//   ClampedNumber(x,y)
//   ClampedNumber( x , y )
//   ClampedNumber(,y)
//   ClampedNumber(x,)
//   ClampedNumber(,)
export const CLAMPED_NUMBER_REGEX = /^ClampedNumber\(\s*([\d.]*)\s*,\s*([\d.]*)\s*\)$/;
