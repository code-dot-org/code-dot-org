// The definition a file is about, held at the top of its workspace
// (specs/LAZY_WORKSPACE_PLAN.md).
//
// `define actor`, `define world`, `define rule` and `define map` are what
// their file IS: everything else in it is about that one thing. So the block
// stays first — nothing can be dragged above it — and cannot be dragged away
// or deleted. Other top blocks (a rule's traits, an actor's handlers) move
// freely below it.
//
// IMPERATIVE, as a body surface's head is (`extensions/bodyOwner`): this is
// the editor's rule about the block, not the file's. Blockly writes
// `movable: false` and `deletable: false` into what it saves for a block that
// has them, so every save takes them back out (`withoutPins`), and the file
// says what it said before.

import type {Blockly} from '@code-dot-org/blockly';

/** The top blocks that are what their file defines. */
export const PINNED_ROOTS: ReadonlySet<string> = new Set([
  'world_actor',
  'world_world',
  'world_rule',
  'world_map',
]);

/** Whether a top block of this type is held first and in place. */
export const isPinnedRoot = (type: string): boolean => PINNED_ROOTS.has(type);

/** Make every pinned definition on the workspace immovable and undeletable. */
export function pinRoots(tops: readonly Blockly.Block[]): void {
  for (const top of tops) {
    if (isPinnedRoot(top.type)) {
      if (top.isMovable()) {
        top.setMovable(false);
      }
      if (top.isDeletable()) {
        top.setDeletable(false);
      }
    }
  }
}

/** A saved document with the pins taken back out of its definitions. */
export function withoutPins<
  D extends {
    blocks?: {
      blocks?: Array<{type: string; movable?: boolean; deletable?: boolean}>;
    };
  },
>(document: D): D {
  const tops = document.blocks?.blocks;
  if (!tops?.some(top => isPinnedRoot(top.type))) {
    return document;
  }
  return {
    ...document,
    blocks: {
      ...document.blocks,
      blocks: tops.map(top => {
        if (!isPinnedRoot(top.type)) {
          return top;
        }
        const rest = {...top};
        delete rest.movable;
        delete rest.deletable;
        return rest;
      }),
    },
  };
}
