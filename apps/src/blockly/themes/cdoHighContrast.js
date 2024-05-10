import HighContrastTheme from '@blockly/theme-highcontrast';
import GoogleBlockly from 'blockly/core';

import fontConstants from '@cdo/apps/fontConstants';

import {Themes} from '../constants';

// Intentionally overriden styles from Google Blockly.
// We do not override list, math, text, or variable blocks.
const coreBlocklyOverrides = {
  logic_blocks: {
    colourPrimary: '#007FAD',
  },
  colour_blocks: {
    colourPrimary: '#006E96',
    colourSecondary: '99C5D5',
    colourTertiary: '#4D9AB6',
  },
  loop_blocks: {
    colourPrimary: '#BC107D',
    colourSecondary: 'E49FCB',
    colourTertiary: '#D058A4',
  },
  procedure_blocks: {
    colourPrimary: '#39700F',
    colourSecondary: '#B0C69F',
    colourTertiary: '#749B57',
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
