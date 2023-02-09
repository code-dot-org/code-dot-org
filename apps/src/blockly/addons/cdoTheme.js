import GoogleBlockly from 'blockly/core';

// Intentionally override definition from core Blockly
export const coreBlocklyOverrides = {
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

export const cdoCustomStyles = {
  default: {
    colourPrimary: '#00b0bc'
  },
  behavior_blocks: {
    colourPrimary: '#20cc4e'
  },
  dance_blocks: {
    colourPrimary: '#7435b2'
  },
  event_blocks: {
    colourPrimary: '#00bc3e'
  },
  music_blocks: {
    colourPrimary: '#5b67a5'
  },
  sprite_blocks: {
    colourPrimary: '#b2353f'
  },
  setup_blocks: {
    colourPrimary: '#fca400'
  },
  world_blocks: {
    colourPrimary: '#5b5ba5'
  },
  flow_blocks: {
    colourPrimary: '#418eb6'
  }
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
