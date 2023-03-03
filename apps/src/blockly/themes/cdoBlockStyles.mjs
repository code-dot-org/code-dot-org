// IMPORTANT! Whenever updating the styles in this file, be sure to also update
// the styles in cdoAccessible.js as well. The accessible styles can be generated
// using accessibleColors.mjs.
// From this directory in your terminal, enter:
// - yarn add nearest-color
// - node accessibleColors.mjs
// - yarn remove nearest-color
// Copy the values output by the script into cdoAccessible and commit both changes together.

// These are the core Blockly styles that we have historically never overridden.
const coreBlocklyStyles = {
  logic_blocks: {
    colourPrimary: '#5b80a5'
  },
  math_blocks: {
    colourPrimary: '#5b67a5'
  },
  text_blocks: {
    colourPrimary: '#5ba58c'
  },
  variable_blocks: {
    colourPrimary: '#a55b99'
  }
};

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

// Standard CDO palette of block colors used across labs
const cdoCustomStyles = {
  default: {
    colourPrimary: '#00b0bc'
  },
  event_blocks: {
    colourPrimary: '#00bc3e'
  },
  lab_blocks: {
    colourPrimary: '#7435b2'
  },
  setup_blocks: {
    colourPrimary: '#fca400'
  },
  world_blocks: {
    colourPrimary: '#5b5ba5'
  },
  ...spriteLabStyles
};

export default {
  ...coreBlocklyStyles,
  ...coreBlocklyOverrides,
  ...cdoCustomStyles
};
