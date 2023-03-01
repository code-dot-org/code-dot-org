import GoogleBlockly from 'blockly/core';
import HighContrastTheme from '@blockly/theme-highcontrast';

// Intentionally overriden styles from Google Blockly.
// We do not override list, logic math, text, or variable blocks.
const coreBlocklyOverrides = {
  colour_blocks: {
    colourPrimary: '#006E96',
    colourSecondary: '99C5D5',
    colourTertiary: '#4D9AB6'
  },
  loop_blocks: {
    colourPrimary: '#BC107D',
    colourSecondary: 'E49FCB',
    colourTertiary: '#D058A4'
  },
  procedure_blocks: {
    colourPrimary: '#39700F',
    colourSecondary: '#B0C69F',
    colourTertiary: '#749B57'
  }
};

// Used for Sprite Lab (and all related level subtypes), and Dance.
const spriteLabHighContrastStyles = {
  behavior_blocks: {
    colourPrimary: '#10812E'
  },
  location_blocks: {
    colourPrimary: '#7C7021'
  },
  sprite_blocks: {
    colourPrimary: '#932A33'
  }
};

// Used only for Dance Party
const danceHighContrastStyles = {
  dance_blocks: {
    colourPrimary: '#622C98'
  }
};

// Experimental MusicLab styles. Subject to change.
const musicLabHighContrastStyles = {
  flow_blocks: {
    colourPrimary: '#2E6988'
  },
  music_blocks: {
    colourPrimary: '#4B568B'
  }
};

// Standard CDO palette of block colors used across labs
const cdoCustomHighContrastStyles = {
  default: {
    colourPrimary: '#00818A'
  },
  comment_blocks: {
    colourPrimary: '#6F6F6F'
  },
  event_blocks: {
    colourPrimary: '#007325'
  },
  setup_blocks: {
    colourPrimary: '#996300'
  },
  world_blocks: {
    colourPrimary: '#4A4A88'
  },
  ...spriteLabHighContrastStyles,
  ...danceHighContrastStyles,
  ...musicLabHighContrastStyles
};

export const cdoHighContrastBlockStyles = {
  ...coreBlocklyOverrides,
  ...cdoCustomHighContrastStyles
};

export default GoogleBlockly.Theme.defineTheme('cdohighcontrast', {
  base: HighContrastTheme,
  blockStyles: cdoHighContrastBlockStyles,
  categoryStyles: {},
  componentStyles: {
    toolboxBackgroundColour: '#DDDDDD'
  },
  fontStyle: {
    family: '"Gotham 4r", sans-serif'
  },
  startHats: null
});
