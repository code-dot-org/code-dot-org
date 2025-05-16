import {
  installAllBlocks as installColourBlocks,
  registerFieldColour,
} from '@blockly/field-colour';
import {javascriptGenerator} from 'blockly/javascript';

import {PluginType} from '../plugins';
import type {GlobalPlugin} from '../plugins';

export const plugin: GlobalPlugin = {
  type: PluginType.Global,
  initialize: () => {
    registerFieldColour();
    installColourBlocks({
      javascript: javascriptGenerator,
    });
  },
};

export default plugin;
