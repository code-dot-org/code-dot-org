import * as BlocklyCore from 'blockly/core';

import {BLOCK_TYPES} from '@cdo/apps/blockly/constants';

export function isFunctionBlock(block: BlocklyCore.Block) {
  return [
    BLOCK_TYPES.procedureDefinition,
    BLOCK_TYPES.procedureDefinitionReturn,
  ].includes(block.type as BLOCK_TYPES);
}
