// Walks over the blocks a scene's saved source holds.

import * as BlocklyCore from 'blockly/core';

import {JsonBlockConfig} from '@cdo/apps/blockly/types';

import {Scene} from './types';

type BlockState = BlocklyCore.serialization.blocks.State;

/** A serialized workspace with each of its top blocks put through `change`.
    A source that holds no blocks is handed back as it is. */
export function mapSavedTopBlocks<
  T extends {blocks?: {languageVersion?: number; blocks?: BlockState[]}}
>(serialized: T, change: (block: BlockState) => BlockState): T {
  const blocks = serialized.blocks?.blocks;
  if (!blocks) {
    return serialized;
  }
  return {
    ...serialized,
    blocks: {...serialized.blocks, blocks: blocks.map(change)},
  };
}

/** Every block of a serialized workspace: shadows and next chains included. */
export function forEachSavedBlock(
  source: unknown,
  visit: (block: JsonBlockConfig) => void
): void {
  const walk = (block?: JsonBlockConfig) => {
    if (!block) {
      return;
    }
    visit(block);
    Object.values(block.inputs || {}).forEach(input => {
      walk(input.block);
      walk(input.shadow);
    });
    if (block.next) {
      walk(block.next.block);
      walk(block.next.shadow);
    }
  };
  (
    (source as {blocks?: {blocks?: JsonBlockConfig[]}} | undefined)?.blocks
      ?.blocks || []
  ).forEach(walk);
}

/** Every non-empty value of `fieldName` on saved blocks of `blockType`. */
export function collectSavedFieldValues(
  scenes: Scene[],
  blockType: string,
  fieldName: string
): string[] {
  const values = new Set<string>();
  scenes.forEach(scene =>
    forEachSavedBlock(scene.source, block => {
      if (block.type !== blockType) {
        return;
      }
      const value = block.fields?.[fieldName];
      if (typeof value === 'string' && value) {
        values.add(value);
      }
    })
  );
  return [...values];
}
