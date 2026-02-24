import * as BlocklyCore from 'blockly/core';

import type {BlockDefinition, CustomInputTypes} from './blockly/types';

/**
 *  * Adds any functions from functionsXml to blocksXml. If a function with the
 *   * same id is already present in blocksXml, it won't be added again.
 *    */
export declare function appendNewFunctions(
  blocksXml: string,
  functionsXml: string
);

export declare function installCustomBlocks(args: {
  blockly: typeof BlocklyCore;
  blockDefinitions: BlockDefinition[];
  customInputTypes: CustomInputTypes;
});
