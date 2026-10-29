// The free play level's catalog of new blocks: the unit's new blocks start
// out of the toolbox and join it one at a time as the student adds them.

import {filterToolboxBlocks} from '@cdo/apps/blockly/utils/toolbox';

import {isAttachShadow} from './addBlocks';
import {BLOCK_HELP, BlockHelp} from './blockHelp/blockHelpContent';
import {ToolboxInfo} from './blockly/toolbox/types';
import {SpriteLab2LevelProperties} from './types';

export interface CatalogEntry {
  type: string;
  help: BlockHelp;
}

// Serialized state under a block that is not a block: a field's value, a
// mutator's extra state, an icon's.
const NON_BLOCK_KEYS = new Set(['fields', 'extraState', 'icons']);

/** The block types in a toolbox or block-state tree, in order. Shadows are
    not blocks of their own (a block's inputs, a dashed placeholder), nor is
    a category. */
export function blockTypesIn(node: unknown, shadow = false): string[] {
  if (Array.isArray(node)) {
    return node.flatMap(value => blockTypesIn(value, shadow));
  }
  if (!node || typeof node !== 'object') {
    return [];
  }
  const record = node as Record<string, unknown>;
  const own =
    typeof record.type === 'string' && !shadow && record.kind !== 'category'
      ? [record.type]
      : [];
  return own.concat(
    Object.entries(record).flatMap(([key, value]) =>
      NON_BLOCK_KEYS.has(key)
        ? []
        : blockTypesIn(value, shadow || key === 'shadow')
    )
  );
}

const unique = (types: string[]) => [...new Set(types)];

/** The blocks a level hands a student: its toolbox, and the blocks
    add_blocks places in the workspace ahead of them. */
export function offeredBlockTypes(level: SpriteLab2LevelProperties): string[] {
  return unique([
    ...blockTypesIn(level.toolboxDefinition),
    ...blockTypesIn(level.addBlocks),
  ]);
}

/** The blocks a student had to use on a level: the block a checklist item
    names (one type; an item that takes any of several names none), the
    block it must hang under, and the blocks add_blocks placed for them to
    build on (an attachTo entry hangs a placeholder, which places nothing). */
export function requiredBlockTypes(level: SpriteLab2LevelProperties): string[] {
  const fromChecks = (level.objectives?.items ?? []).flatMap(({check}) =>
    check.kind === 'block'
      ? [typeof check.type === 'string' ? check.type : undefined, check.under]
      : []
  );
  const placed = (level.addBlocks ?? []).filter(
    entry => !isAttachShadow(entry)
  );
  return unique([
    ...fromChecks.filter((type): type is string => !!type),
    ...blockTypesIn(placed),
  ]);
}

/** The blocks a level offers that no earlier level of the lesson required:
    the ones a student meets here first, and the ones an earlier level
    offered without needing them for its checklist. */
export function newBlockTypes(
  level: SpriteLab2LevelProperties,
  earlier: readonly SpriteLab2LevelProperties[]
): string[] {
  const required = new Set(earlier.flatMap(requiredBlockTypes));
  return offeredBlockTypes(level).filter(type => !required.has(type));
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
  return filterToolboxBlocks(
    toolbox,
    block => !(block.type && types.has(block.type))
  );
}
