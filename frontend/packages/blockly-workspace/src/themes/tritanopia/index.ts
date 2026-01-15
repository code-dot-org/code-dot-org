import * as Blockly from 'blockly/core';

import {definition as DefaultDefinition} from '../default';

/**
 * This blockly theme is used to provide a constrasting palette for those with varying ability to distinguish among blues, yellows, and purples.
 */
export const definition = {
  ...DefaultDefinition,
  name: 'tritanopia',
  option: 'Tritanopia Theme',
  blockStyles: {
    default: {
      colourPrimary: '#009175',
    },
    setup_blocks: {
      colourPrimary: '#FF4235',
    },
    event_blocks: {
      colourPrimary: '#00735C',
    },
    loop_blocks: {
      colourPrimary: '#D80D7B',
    },
    logic_blocks: {
      colourPrimary: '#0079FA',
    },
    procedure_blocks: {
      colourPrimary: '#005A01',
    },
    variable_blocks: {
      colourPrimary: '#AB0D61',
      // We use the primary colour for variable shadow blocks. Shadow blocks cannot include a variable field,
      // so this only ever applies to argument_reporter blocks.
      colourSecondary: '#AB0D61',
    },
    math_blocks: {
      colourPrimary: '#6B069F',
    },
    text_blocks: {
      colourPrimary: '#00306F',
    },
    colour_blocks: {
      colourPrimary: '#460B70',
    },
    sprite_blocks: {
      colourPrimary: '#810D49',
    },
    world_blocks: {
      colourPrimary: '#8E06CD',
    },
    behavior_blocks: {
      colourPrimary: '#5A0A33',
    },
    location_blocks: {
      colourPrimary: '#ED0DFD',
    },
    lab_blocks: {
      colourPrimary: '#B40AFC',
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
