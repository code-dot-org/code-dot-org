import * as BlocklyCore from 'blockly/core';
import {cloneDeep} from 'lodash';

import {isBlockInfo, isStaticCategoryInfo} from './typeGuards';

type ToolboxInfo = BlocklyCore.utils.toolbox.ToolboxInfo;
type ToolboxItemInfo = BlocklyCore.utils.toolbox.ToolboxItemInfo;
type BlockInfo = BlocklyCore.utils.toolbox.BlockInfo;
type SerializedBlock = BlocklyCore.serialization.blocks.State;

// Drop unregistered nested blocks/shadows from a serialized block's inputs
// and next chain.
function pruneSerializedBlock(block: BlockInfo | SerializedBlock): void {
  const inputs: {
    [name: string]: BlocklyCore.serialization.blocks.ConnectionState;
  } = block.inputs || {};
  Object.values(inputs).forEach(input => {
    (['block', 'shadow'] as const).forEach(key => {
      const child = input[key];
      if (!child) {
        return;
      }
      if (child.type && !Blockly.Blocks[child.type]) {
        delete input[key];
      } else {
        pruneSerializedBlock(child);
      }
    });
  });
  const next = block.next?.block;
  if (next) {
    if (next.type && !Blockly.Blocks[next.type]) {
      delete block.next;
    } else {
      pruneSerializedBlock(next);
    }
  }
}

/**
 * Remove block/shadow entries from a toolbox definition whose type isn't
 * registered in Blockly. A level's toolbox can reference blocks that aren't
 * in the installed block pool; without filtering, opening that category
 * throws "Invalid block definition for type ...". Call after blocks are
 * installed.
 */
export function filterToolboxToRegisteredBlocks(def: ToolboxInfo): ToolboxInfo {
  const out = cloneDeep(def);
  const filterEntries = (entries: ToolboxItemInfo[]): ToolboxItemInfo[] =>
    entries.filter(entry => {
      if (isStaticCategoryInfo(entry)) {
        entry.contents = filterEntries(entry.contents || []);
        return true;
      }
      if (isBlockInfo(entry) && entry.type) {
        if (!Blockly.Blocks[entry.type]) {
          return false;
        }
        pruneSerializedBlock(entry);
      }
      return true;
    });
  out.contents = filterEntries(out.contents);
  return out;
}
