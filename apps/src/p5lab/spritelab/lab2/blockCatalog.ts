// The free play level's catalog of new blocks: the unit's new blocks start
// out of the toolbox and join it one at a time as the student adds them.

import {cloneDeep} from 'lodash';

import {
  isBlockInfo,
  isStaticCategoryInfo,
} from '@cdo/apps/blockly/utils/toolbox';

import {BLOCK_HELP, BlockHelp} from './blockHelp/blockHelpContent';
import {ToolboxInfo, ToolboxItemInfo} from './blockly/toolbox/types';

export interface CatalogEntry {
  type: string;
  help: BlockHelp;
}

/**
 * The catalog's blocks, in toolbox order. A new block without help has
 * nothing to show in the catalog, so it stays in the toolbox as usual.
 */
export function catalogEntries(
  newBlocks: readonly string[] | undefined
): CatalogEntry[] {
  return (newBlocks ?? []).flatMap(type => {
    const help = BLOCK_HELP[type];
    return help ? [{type, help}] : [];
  });
}

/** The catalog blocks the student has not added to the toolbox. */
export function heldBackBlockTypes(
  entries: readonly CatalogEntry[],
  chosen: readonly string[] | undefined
): Set<string> {
  const added = new Set(chosen ?? []);
  return new Set(
    entries.map(entry => entry.type).filter(type => !added.has(type))
  );
}

/** The toolbox with these block types left out; categories stay. */
export function withoutBlockTypes(
  toolbox: ToolboxInfo,
  types: ReadonlySet<string>
): ToolboxInfo {
  if (types.size === 0) {
    return toolbox;
  }
  const out = cloneDeep(toolbox);
  const keep = (entries: ToolboxItemInfo[]): ToolboxItemInfo[] =>
    entries.filter(entry => {
      if (isStaticCategoryInfo(entry)) {
        entry.contents = keep(entry.contents || []);
        return true;
      }
      return !(isBlockInfo(entry) && entry.type && types.has(entry.type));
    });
  out.contents = keep(out.contents);
  return out;
}
