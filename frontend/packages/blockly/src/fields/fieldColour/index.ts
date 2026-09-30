import {
  colourBlend,
  colourPicker,
  colourRandom,
  colourRgb,
  registerFieldColour,
} from '@blockly/field-colour';
import * as Blockly from 'blockly/core';
import {javascriptGenerator} from 'blockly/javascript';

import {PluginType} from '../../plugins';
import type {FieldPlugin} from '../../plugins';

export const plugin: FieldPlugin = {
  type: PluginType.Field,
  name: 'field_colour',
  initialize: () => {
    const generators = {javascript: javascriptGenerator};
    registerFieldColour();
    colourPicker.installBlock(generators);
    colourRgb.installBlock(generators);
    colourBlend.installBlock(generators);
    // BaseBlocks' US-spelled colour_random, when a workspace registered it.
    if (!Blockly.Blocks[colourRandom.BLOCK_NAME]) {
      colourRandom.installBlock(generators);
    }
  },
};

export default plugin;
