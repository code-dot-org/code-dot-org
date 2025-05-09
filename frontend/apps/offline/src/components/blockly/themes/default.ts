import * as BlocklyLibrary from 'blockly/core';

/**
 * The default blockly theme used to typically style the blocks in labs.
 */
export const definition = {
  name: 'cdo-default',
  blockLimits: {
    indicator: {
      fill: 'var(--background-info-primary)',
      text: 'var(--background-info-light)',
    },
    overLimit: {
      fill: 'var(--background-warning-primary)',
      text: 'var(--text-warning-secondary)',
    },
  },
  fontStyle: {
    family: 'Georgia, serif',
    weight: 'bold',
    size: 12,
  },
  blockStyles: {
    default: {
      colourPrimary: '#00b0bc',
      colourSecondary: '#00b0bc',
      colourTertiary: '#00b0bc',
      hat: '',
    },
    setup_blocks: {
      colourPrimary: '#fca400',
      colourSecondary: '#fca400',
      colourTertiary: '#fca400',
      hat: '',
    },
    event_blocks: {
      colourPrimary: '#00bc3e',
      colourSecondary: '#00bc3e',
      colourTertiary: '#00bc3e',
      hat: '',
    },
    loop_blocks: {
      colourPrimary: '#f218a2',
      colourSecondary: '#f218a2',
      colourTertiary: '#f218a2',
      hat: '',
    },
    logic_blocks: {
      colourPrimary: '#0094ca',
      colourSecondary: '#0094ca',
      colourTertiary: '#0094ca',
      hat: '',
    },
    procedure_blocks: {
      colourPrimary: '#509918',
      colourSecondary: '#509918',
      colourTertiary: '#509918',
      hat: '',
    },
    variable_blocks: {
      colourPrimary: '#a55b99', // Blockly default style
      // We use the primary colour for variable shadow blocks. Shadow blocks cannot include a variable field,
      // so this only ever applies to argument_reporter blocks.
      colourSecondary: '#a55b99',
      colourTertiary: '#a55b99',
      hat: '',
    },
    math_blocks: {
      colourPrimary: '#5b67a5', // Blockly default style
      colourSecondary: '#5b67a5', // Blockly default style
      colourTertiary: '#5b67a5', // Blockly default style
      hat: '',
    },
    text_blocks: {
      colourPrimary: '#5ba58c', // Blockly default style
      colourSecondary: '#5ba58c',
      colourTertiary: '#5ba58c',
      hat: '',
    },
    colour_blocks: {
      colourPrimary: '#0093c9',
      colourSecondary: '#0093c9',
      colourTertiary: '#0093c9',
      hat: '',
    },
    sprite_blocks: {
      // Used in Sprite Lab, Dance, Poetry
      colourPrimary: '#b2353f',
      colourSecondary: '#b2353f',
      colourTertiary: '#b2353f',
      hat: '',
    },
    world_blocks: {
      // Used in Sprite Lab, Dance, Poetry
      colourPrimary: '#5b5ba5',
      colourSecondary: '#5b5ba5',
      colourTertiary: '#5b5ba5',
      hat: '',
    },
    behavior_blocks: {
      // Used in Sprite Lab, Dance
      colourPrimary: '#20cc4e',
      colourSecondary: '#20cc4e',
      colourTertiary: '#20cc4e',
      hat: '',
    },
    location_blocks: {
      // Used in Sprite Lab only
      colourPrimary: '#ead446',
      colourSecondary: '#ead446',
      colourTertiary: '#ead446',
      hat: '',
    },
    lab_blocks: {
      // Formerly called dance_blocks, music_blocks
      colourPrimary: '#7435b2',
      colourSecondary: '#7435b2',
      colourTertiary: '#7435b2',
      hat: '',
    },
  },
  categoryStyles: {},
  componentStyles: {
    toolboxBackgroundColour: '#dddddd',
  },
  startHats: undefined,
};

const instance = BlocklyLibrary.Theme.defineTheme(definition.name, {
  base: BlocklyLibrary.Themes.Classic,
  ...definition,
});

const theme = {
  definition,
  instance,
};

export default theme;
