// The free play level's catalog of new blocks: the unit's new blocks start
// out of the toolbox and join it one at a time as the student adds them.

import {filterToolboxBlocks} from '@cdo/apps/blockly/utils/toolbox';

import {isAttachment} from './addBlocks';
import {BLOCK_HELP, BlockHelp} from './blockHelp/blockHelpContent';
import {ToolboxInfo} from './blockly/toolbox/types';
import {SpriteLab2LevelProperties} from './types';

export interface CatalogEntry {
  type: string;
  help: BlockHelp;
}

// Keys in serialized block state whose values are not child blocks: a
// field's value, a mutator's extra state, an icon's state.
const NON_BLOCK_KEYS = new Set(['fields', 'extraState', 'icons']);

/** The block types in a toolbox or serialized block tree, in order. Shadow
    blocks (a block's input defaults, a dashed placeholder) and categories
    are not counted. */
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

/** The block types a level offers a student: its toolbox, plus the blocks
    add_blocks places in the workspace before the student starts. */
export function offeredBlockTypes(level: SpriteLab2LevelProperties): string[] {
  return unique([
    ...blockTypesIn(level.toolboxDefinition),
    ...blockTypesIn(level.addBlocks),
  ]);
}

/** The block types a student had to use on a level: the block a checklist
    item names (an item that accepts any of several types names none), the
    block it must sit under, and the blocks add_blocks placed for the
    student to build on. An attachTo entry adds a placeholder or empty room
    and places no block, so it is not counted. */
export function requiredBlockTypes(level: SpriteLab2LevelProperties): string[] {
  const fromChecks = (level.objectives?.items ?? []).flatMap(({check}) =>
    check.kind === 'block'
      ? [typeof check.type === 'string' ? check.type : undefined, check.under]
      : []
  );
  const placed = (level.addBlocks ?? []).filter(entry => !isAttachment(entry));
  return unique([
    ...fromChecks.filter((type): type is string => !!type),
    ...blockTypesIn(placed),
  ]);
}

/** The block types a level offers that no earlier level of the lesson
    required: the blocks a student meets here for the first time, plus any
    an earlier level offered without its checklist needing them. */
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
