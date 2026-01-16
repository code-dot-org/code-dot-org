import DarkTheme from '@blockly/theme-dark';
import * as Blockly from 'blockly/core';

import {definition as DefaultDefinition} from '../default';

/**
 * The default blockly theme used to typically style the blocks in labs.
 */
export const definition = {
  name: 'dark',
  option: 'Modern Dark Theme',
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
  trashcan: {
    fill: 'var(--background-brand-purple-primary)',
  },
  fontStyle: {
    ...DefaultDefinition.fontStyle,
  },
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
      colourPrimary: '#a55b99',
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
      colourPrimary: '#b2353f',
    },
    world_blocks: {
      colourPrimary: '#5b5ba5',
    },
    behavior_blocks: {
      colourPrimary: '#20cc4e',
    },
    location_blocks: {
      colourPrimary: '#ead446',
    },
    lab_blocks: {
      colourPrimary: '#7435b2',
    },
    comment_blocks: {
      colourPrimary: '#aaaaaa',
    },
  },
  categoryStyles: {},
  componentStyles: {
    toolboxBackgroundColour: '#dddddd',
    workspaceBackgroundColour: 'var(--neutral-base-black)',
    blackBackground: 'var(--neutral-gray-95)',
    flyoutBackgroundColour: 'var(--neutral-gray-95)',
    flyoutOpacity: 0.8,
  },
  startHats: DefaultDefinition.startHats,
};

const instance = Blockly.Theme.defineTheme(definition.name, {
  base: DarkTheme,
  ...definition,
});

const theme = {
  definition,
  instance,
};

export default theme;
