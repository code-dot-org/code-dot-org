import GoogleBlockly from 'blockly/core';

// Intentionally overriden styles from Google Blockly.
// We do not override list, logic math, text, or variable blocks.
const coreBlocklyOverrides = {
  colour_blocks: {
    colourPrimary: '#009FFA'
  },
  loop_blocks: {
    colourPrimary: '#FF2E95'
  },
  procedure_blocks: {
    colourPrimary: '#009503'
  }
};

// Used for Sprite Lab (and all related level subtypes), and Dance.
const spriteLabAccessibleStyles = {
  behavior_blocks: {
    colourPrimary: '#00AF8E'
  },
  location_blocks: {
    colourPrimary: '#FFB935'
  },
  sprite_blocks: {
    colourPrimary: '#B20725'
  }
};

// Used only for Dance Party
const danceAccessibleStyles = {
  dance_blocks: {
    colourPrimary: '#8E06CD'
  }
};

// Experimental MusicLab styles. Subject to change.
const musicLabAccessibleStyles = {
  flow_blocks: {
    colourPrimary: '#00AF8E'
  },
  music_blocks: {
    colourPrimary: '#6B069F'
  }
};

// Standard CDO palette of block colors used across labs
const cdoCustomAccessibleStyles = {
  default: {
    colourPrimary: '#00CBA7'
  },
  event_blocks: {
    colourPrimary: '#00B408'
  },
  setup_blocks: {
    colourPrimary: '#FF8735'
  },
  world_blocks: {
    colourPrimary: '#6B069F'
  },
  ...spriteLabAccessibleStyles,
  ...danceAccessibleStyles,
  ...musicLabAccessibleStyles
};

export const cdoAccessibleBlockStyles = {
  ...coreBlocklyOverrides,
  ...cdoCustomAccessibleStyles
};

export default GoogleBlockly.Theme.defineTheme('cdoaccessible', {
  base: GoogleBlockly.Themes.Classic,
  blockStyles: cdoAccessibleBlockStyles,
  categoryStyles: {},
  componentStyles: {
    toolboxBackgroundColour: '#DDDDDD'
  },
  fontStyle: {
    family: '"Gotham 4r", sans-serif'
  },
  startHats: null
});
