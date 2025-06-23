import HighContrastTheme from '@blockly/theme-highcontrast';
import * as GoogleBlockly from 'blockly/core';

import fontConstants from '@cdo/apps/fontConstants';

import {Themes} from '../constants';

// Our themes only define the primary colour for each block style.
// By doing this, we allow Blockly to automatically generate secondary and tertiary colors.
// This is important for dark mode as we override the secondary color generation method.
for (const key in HighContrastTheme.blockStyles) {
  delete HighContrastTheme.blockStyles[key].colourSecondary;
  delete HighContrastTheme.blockStyles[key].colourTertiary;
}

// We use the primary colour for variable shadow blocks. Shadow blocks cannot include a variable field,
// so this only applies to argument_reporter blocks.
const variableColor =
  HighContrastTheme.blockStyles.variable_blocks.colourPrimary;

// Intentionally overriden styles from Google Blockly.
// We do not override list, math, or text blocks.
const coreBlocklyOverrides = {
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
    colourSecondary: variableColor,
  },
};

// Used for Sprite Lab (and all related level subtypes), and Dance.
const spriteLabHighContrastStyles = {
  behavior_blocks: {
    colourPrimary: '#10812E',
  },
  location_blocks: {
    colourPrimary: '#7C7021',
  },
  sprite_blocks: {
    colourPrimary: '#932A33',
  },
};

// Standard CDO palette of block colors used across labs
const cdoCustomHighContrastStyles = {
  default: {
    colourPrimary: '#00818A',
  },
  comment_blocks: {
    colourPrimary: '#6F6F6F',
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
  ...spriteLabHighContrastStyles,
};

export const cdoHighContrastBlockStyles = {
  ...coreBlocklyOverrides,
  ...cdoCustomHighContrastStyles,
};

export default GoogleBlockly.Theme.defineTheme(Themes.HIGH_CONTRAST, {
  base: HighContrastTheme,
  blockStyles: cdoHighContrastBlockStyles,
  categoryStyles: {},
  componentStyles: {
    toolboxBackgroundColour: '#DDDDDD',
  },
  fontStyle: {
    family: fontConstants['main-font'],
    weight: fontConstants['regular-font-weight'],
  },
  startHats: null,
});
