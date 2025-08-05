import type * as Blockly from 'blockly/core';

import type {BlocklySerialization} from '@code-dot-org/blockly-workspace';

/** Generic description for Blockly data. */
export interface BlocklyData {
  startBlocks?: BlocklySerialization;
  toolboxBlocks?: Blockly.utils.toolbox.ToolboxInfo;
  solutionBlocks?: BlocklySerialization;
  idealBlockCount?: number;
}
