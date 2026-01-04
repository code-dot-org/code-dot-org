import {
  installAllBlocks as installColourBlocks,
  registerFieldColour,
} from '@blockly/field-colour';
import {javascriptGenerator} from 'blockly/javascript';

import {PluginType} from '@blockly-workspace/plugins';
import type {FieldPlugin} from '@blockly-workspace/plugins';

export const plugin: FieldPlugin = {
  type: PluginType.Field,
  name: 'field_colour',
  initialize: () => {
    console.log('registering field colour');
    registerFieldColour();
    installColourBlocks({
      javascript: javascriptGenerator,
    });
  },
};

export default plugin;
