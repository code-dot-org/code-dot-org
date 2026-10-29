import * as BlocklyCore from 'blockly/core';
import {cloneDeep} from 'lodash';

import {isBlockInfo, isStaticCategoryInfo} from './typeGuards';

type ToolboxInfo = BlocklyCore.utils.toolbox.ToolboxInfo;
type ToolboxItemInfo = BlocklyCore.utils.toolbox.ToolboxItemInfo;
type BlockInfo = BlocklyCore.utils.toolbox.BlockInfo;

/**
 * A copy of a toolbox definition holding only the blocks `keep` accepts, at
 * every category depth; categories stay. `keep` is handed the copy's block,
 * so it may trim it.
 */
export function filterToolboxBlocks(
  def: ToolboxInfo,
  keep: (block: BlockInfo) => boolean
): ToolboxInfo {
  const out = cloneDeep(def);
  const filterEntries = (entries: ToolboxItemInfo[]): ToolboxItemInfo[] =>
    entries.filter(entry => {
      if (isStaticCategoryInfo(entry)) {
        entry.contents = filterEntries(entry.contents || []);
        return true;
      }
      return !isBlockInfo(entry) || keep(entry);
    });
  out.contents = filterEntries(out.contents);
  return out;
}
