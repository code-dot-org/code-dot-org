import * as BlocklyCore from 'blockly/core';

import {ExtendedBlock} from '@cdo/apps/blockly/types';

/** The code under a hat block, which the hat wraps as its callback body. */
export function hatBody(
  block: BlocklyCore.Block,
  generator: BlocklyCore.CodeGenerator
): string {
  const code = generator.blockToCode(block.getNextBlock());
  return generator.prefixLines(
    typeof code === 'string' ? code : code[0],
    generator.INDENT
  );
}

// The hat generates the blocks below it; without this they would also be
// generated again at top level, outside the callback.
export const HAT_OPTIONS: Partial<ExtendedBlock> = {
  skipNextBlockGeneration: true,
};
