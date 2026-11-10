import {
  blocks,
  ObservableParameterModel,
  ObservableProcedureModel,
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

    // The library's registerProcedureSerializer warns when none is registered.
    if (
      Blockly.registry.hasItem(Blockly.registry.Type.SERIALIZER, 'procedures')
    ) {
      Blockly.serialization.registry.unregister('procedures');
    }
    Blockly.serialization.registry.register(
      'procedures',
      new Blockly.serialization.procedures.ProcedureSerializer(
        ObservableProcedureModel,
        ObservableParameterModel,
      ),
    );
  },
};

export default plugin;
