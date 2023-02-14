import GoogleBlockly from 'blockly/core';

// Intentionally overriden styles from Google Blockly.
// We do not override list, math, text, or variable blocks.
const coreBlocklyOverrides = {
  colour_blocks: {
    colourPrimary: '#0093c9'
  },
  loop_blocks: {
    colourPrimary: '#f218a2'
  },
  procedure_blocks: {
    colourPrimary: '#509918'
  }
};

// Used for Sprite Lab (and all related level subtypes), and Dance.
const spriteLabStyles = {
  behavior_blocks: {
    colourPrimary: '#20cc4e'
  },
  location_blocks: {
    colourPrimary: '#ead446'
  },
  sprite_blocks: {
    colourPrimary: '#b2353f'
  }
};

// Used only for Dance Party
const danceStyles = {
  dance_blocks: {
    colourPrimary: '#7435b2'
  }
};

// Experimental MusicLab styles. Subject to change.
const musicLabStyles = {
  flow_blocks: {
    colourPrimary: '#418eb6'
  },
  music_blocks: {
    colourPrimary: '#5b67a5'
  }
};

// Standard CDO palette of block colors used across labs
const cdoCustomStyles = {
  default: {
    colourPrimary: '#00b0bc'
  },
  comment_blocks: {
    colourPrimary: '#b2b2b2'
  },
  event_blocks: {
    colourPrimary: '#00bc3e'
  },
  setup_blocks: {
    colourPrimary: '#fca400'
  },
  world_blocks: {
    colourPrimary: '#5b5ba5'
  },
  ...spriteLabStyles,
  ...danceStyles,
  ...musicLabStyles
};

export const cdoBlockStyles = {
  ...coreBlocklyOverrides,
  ...cdoCustomStyles
};

export default GoogleBlockly.Theme.defineTheme('modern', {
  base: GoogleBlockly.Themes.Classic,
  blockStyles: cdoBlockStyles,
  categoryStyles: {},
  componentStyles: {
    toolboxBackgroundColour: '#DDDDDD'
  },
  fontStyle: {
    family: '"Gotham 4r", sans-serif'
  },
  startHats: null
});
