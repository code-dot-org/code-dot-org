import HighContrastTheme from '@blockly/theme-highcontrast';
import * as Blockly from 'blockly/core';

import {definition as DefaultDefinition} from '../default';

// Give ourselves permission to delete the secondary and tertiary keys of the imported blockly theme
type AlteredBaseTheme = Omit<typeof HighContrastTheme, 'blockStyles'> & {
  blockStyles: {
    [key: string]: Omit<
      (typeof HighContrastTheme)['blockStyles'][string],
      'colourSecondary' | 'colourTertiary'
    > & {
      colourSecondary?: string;
      colourTertiary?: string;
    };
  };
};
const AlteredHighContrastTheme = HighContrastTheme as AlteredBaseTheme;

// Our themes only define the primary colour for each block style.
// By doing this, we allow Blockly to automatically generate secondary and tertiary colors.
// This is important for dark mode as we override the secondary color generation method.
for (const key in AlteredHighContrastTheme.blockStyles) {
  delete AlteredHighContrastTheme.blockStyles[key].colourSecondary;
  delete AlteredHighContrastTheme.blockStyles[key].colourTertiary;
}

// We use the primary colour for variable shadow blocks. Shadow blocks cannot include a variable field,
// so this only applies to argument_reporter blocks.
const variableColor =
  HighContrastTheme.blockStyles.variable_blocks.colourPrimary;

/**
 * This blockly theme is used to provide a varied but highly constrasting palette.
 */
export const definition = {
  ...DefaultDefinition,
  name: 'high-contrast',
  option: 'High Contrast Theme',
  blockStyles: {
    default: {
      colourPrimary: '#00818A',
    },
    logic_blocks: {
      colourPrimary: '#007FAD',
    },
    colour_blocks: {
      colourPrimary: '#006E96',
    },
    loop_blocks: {
      colourPrimary: '#BC107D',
    },
    procedure_blocks: {
      colourPrimary: '#39700F',
    },
    variable_blocks: {
      colourPrimary: variableColor,
      // We use the primary colour for variable shadow blocks. Shadow blocks cannot include a variable field,
      // so this only ever applies to argument_reporter blocks.
      colourSecondary: variableColor,
    },
    math_blocks: {
      colourPrimary: HighContrastTheme.blockStyles.math_blocks.colourPrimary,
    },
    text_blocks: {
      colourPrimary: HighContrastTheme.blockStyles.text_blocks.colourPrimary,
    },
    behavior_blocks: {
      colourPrimary: '#10812E',
    },
    location_blocks: {
      colourPrimary: '#7C7021',
    },
    sprite_blocks: {
      colourPrimary: '#932A33',
    },
    event_blocks: {
      colourPrimary: '#007325',
    },
    lab_blocks: {
      colourPrimary: '#622C98',
    },
    setup_blocks: {
      colourPrimary: '#996300',
    },
    world_blocks: {
      colourPrimary: '#4A4A88',
    },
    ai_blocks: {
      colourPrimary: '#566065',
    },
    comment_blocks: {
      colourPrimary: '#6F6F6F',
    },
  },
};

const instance = Blockly.Theme.defineTheme(definition.name, {
  base: HighContrastTheme,
  ...definition,
});

const theme = {
  definition,
  instance,
};

export default theme;
