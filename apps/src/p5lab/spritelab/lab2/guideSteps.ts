// Staged floating-guide instructions (the guide_steps level property):
// the pure step-advancement logic. SpriteLab2View owns the state.

import {SpriteLab2GuideStep} from './types';
import {WorldCell} from './world';

export interface WorldCounts {
  blocks: number;
  sprites: number;
}

// Tally of placed World cells by kind — the counts guide conditions read.
export function countWorldCells(grid?: (WorldCell | null)[][]): WorldCounts {
  let blocks = 0;
  let sprites = 0;
  grid?.forEach(row =>
    row?.forEach(cell => {
      if (cell?.kind === 'block') {
        blocks++;
      } else if (cell?.kind === 'sprite') {
        sprites++;
      }
    })
  );
  return {blocks, sprites};
}

// The step the guide should show, starting from `index` and advancing while
// the next step's `after` condition holds (every listed clause must pass).
// Advances only: retreat is the caller's to prevent, and a next step with
// no condition is never reached automatically — steps after the first are
// expected to declare `after`.
export function nextGuideStepIndex(
  steps: SpriteLab2GuideStep[] | undefined,
  index: number,
  counts: WorldCounts,
  activeTab: string
): number {
  let result = index;
  for (;;) {
    const after = steps?.[result + 1]?.after;
    if (
      !after ||
      (after.worldBlocks !== undefined && counts.blocks < after.worldBlocks) ||
      (after.worldSprite && counts.sprites === 0) ||
      (after.tab !== undefined && after.tab !== activeTab)
    ) {
      return result;
    }
    result++;
  }
}
