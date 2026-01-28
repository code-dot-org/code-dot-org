import {
  installAllBlocks as installColourBlocks,
  registerFieldColour,
} from '@blockly/field-colour';
import {javascriptGenerator} from 'blockly/javascript';

import {PluginType} from '../../../plugins';
import type {FieldPlugin} from '../../../plugins';

export const plugin: FieldPlugin = {
  type: PluginType.Field,
  name: 'field_colour',
  initialize: () => {
    registerFieldColour();
    installColourBlocks({
      javascript: javascriptGenerator,
    });
  },
};

export default plugin;
