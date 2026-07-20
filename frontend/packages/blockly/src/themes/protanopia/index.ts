import * as Blockly from 'blockly/core';

import {definition as DefaultDefinition} from '../default';

/**
 * This blockly theme is used to provide a constrasting palette for those with varying ability to distinguish red and green colors.
 */
export const definition = {
  ...DefaultDefinition,
  name: 'protanopia',
  option: 'Protanopia Theme',
  blockStyles: {
    default: {
      colourPrimary: '#009175',
    },
    setup_blocks: {
      colourPrimary: '#FF4235',
    },
    event_blocks: {
      colourPrimary: '#009503',
    },
    loop_blocks: {
      colourPrimary: '#FF2E95',
    },
    logic_blocks: {
      colourPrimary: '#005FCC',
    },
    procedure_blocks: {
      colourPrimary: '#007702',
    },
    variable_blocks: {
      colourPrimary: '#AB0D61',
      // We use the primary colour for variable shadow blocks. Shadow blocks cannot include a variable field,
      // so this only ever applies to argument_reporter blocks.
      colourSecondary: '#AB0D61',
    },
    math_blocks: {
      colourPrimary: '#00489E',
    },
    text_blocks: {
      colourPrimary: '#00735C',
    },
    colour_blocks: {
      colourPrimary: '#0079FA',
    },
    sprite_blocks: {
      colourPrimary: '#810D49',
    },
    world_blocks: {
      colourPrimary: '#460B70',
    },
    behavior_blocks: {
      colourPrimary: '#005745',
    },
    location_blocks: {
      colourPrimary: '#D80D7B',
    },
    lab_blocks: {
      colourPrimary: '#5A0A33',
    },
    ai_blocks: {
      colourPrimary: '#566065',
    },
    comment_blocks: {
      colourPrimary: '#aaaaaa',
    },
  },
};

const instance = Blockly.Theme.defineTheme(definition.name, {
  base: Blockly.Themes.Classic,
  ...definition,
});

const theme = {
  definition,
  instance,
};

export default theme;
