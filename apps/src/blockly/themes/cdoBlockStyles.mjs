// IMPORTANT! Whenever updating the styles in this file, be sure to also update
// the styles in cdoAccessible.js as well. The accessible styles can be generated
// using accessibleColors.mjs.
// From this directory in your terminal, enter:
// - yarn add nearest-color
// - node accessibleColors.mjs
// - yarn remove nearest-color
// Copy the values output by the script into cdoAccessible and commit both changes together.

// Intentionally overriden styles from Google Blockly.
// We do not override list, logic, math, text, or variable blocks.
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

export default {
  ...coreBlocklyOverrides,
  ...cdoCustomStyles
};
