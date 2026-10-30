import * as BlocklyCore from 'blockly/core';

import {ExtendedJavascriptGenerator} from '@cdo/apps/blockly/types';

export function copyBlockGenerator(
  generator: ExtendedJavascriptGenerator,
  type1: string,
  type2: string
) {
  generator.forBlock[type1] = generator.forBlock[type2];
}

export function defineNewBlockGenerator(
  generator: ExtendedJavascriptGenerator,
  type: string,
  generatorFunction: (
    block: BlocklyCore.Block,
    generator: BlocklyCore.CodeGenerator
  ) => [string, number] | string | null
) {
  generator.forBlock[type] = generatorFunction;
}
