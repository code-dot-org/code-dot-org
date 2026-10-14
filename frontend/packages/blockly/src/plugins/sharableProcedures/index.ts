import {
  blocks,
  unregisterProcedureBlocks,
} from '@blockly/block-shareable-procedures';
import * as Blockly from 'blockly/core';

import {PluginType} from '../../plugins';
import type {GlobalPlugin} from '../../plugins';

export const plugin: GlobalPlugin = {
  type: PluginType.Global,
  initialize: () => {
    unregisterProcedureBlocks();
    Blockly.common.defineBlocks(blocks);
  },
};

export default plugin;
