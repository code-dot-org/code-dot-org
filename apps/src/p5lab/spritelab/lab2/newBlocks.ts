// Which toolbox blocks are new to a student: the ones no scene of their
// project has used. The unit's levels share one project, so by free play
// every block a level asked for is in some scene.

import {Scene} from './types';

interface SavedBlock {
  type: string;
  inputs?: Record<string, {block?: SavedBlock; shadow?: SavedBlock}>;
  next?: {block?: SavedBlock; shadow?: SavedBlock};
}

/** Block types placed in any scene; shadows are not placements. */
export function usedBlockTypes(scenes: Scene[]): Set<string> {
  const used = new Set<string>();
  const walk = (block?: SavedBlock) => {
    if (!block) {
      return;
    }
    used.add(block.type);
    Object.values(block.inputs ?? {}).forEach(input => walk(input.block));
    walk(block.next?.block);
  };
  scenes.forEach(scene => {
    (
      (scene.source as {blocks?: {blocks?: SavedBlock[]}} | undefined)?.blocks
        ?.blocks ?? []
    ).forEach(walk);
  });
  return used;
}
