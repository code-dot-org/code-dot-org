import * as BlocklyLibrary from 'blockly/core';

/**
 * The default blockly theme used to typically style the blocks in labs.
 */
export const theme = {
  name: 'cdo-default',
  blockStyles: {
    default: {
      colourPrimary: '#00b0bc',
    },
    setup_blocks: {
      colourPrimary: '#fca400',
    },
    event_blocks: {
      colourPrimary: '#00bc3e',
    },
    loop_blocks: {
      colourPrimary: '#f218a2',
    },
    logic_blocks: {
      colourPrimary: '#0094ca',
    },
    procedure_blocks: {
      colourPrimary: '#509918',
    },
    variable_blocks: {
      colourPrimary: '#a55b99', // Blockly default style
      // We use the primary colour for variable shadow blocks. Shadow blocks cannot include a variable field,
      // so this only ever applies to argument_reporter blocks.
      colourSecondary: '#a55b99',
    },
    math_blocks: {
      colourPrimary: '#5b67a5', // Blockly default style
    },
    text_blocks: {
      colourPrimary: '#5ba58c', // Blockly default style
    },
    colour_blocks: {
      colourPrimary: '#0093c9',
    },
    sprite_blocks: {
      // Used in Sprite Lab, Dance, Poetry
      colourPrimary: '#b2353f',
    },
    world_blocks: {
      // Used in Sprite Lab, Dance, Poetry
      colourPrimary: '#5b5ba5',
    },
    behavior_blocks: {
      // Used in Sprite Lab, Dance
      colourPrimary: '#20cc4e',
    },
    location_blocks: {
      // Used in Sprite Lab only
      colourPrimary: '#ead446',
    },
    lab_blocks: {
      // Formerly called dance_blocks, music_blocks
      colourPrimary: '#7435b2',
    },
  },
  categoryStyles: {},
  componentStlyes: {
    toolboxBackgroundColor: '#dddddd',
  },
  startHats: null,
};

export default BlocklyLibrary.Theme.defineTheme(theme.name, {
  base: BlocklyLibrary.Themes.Classic,
  ...theme,
});
