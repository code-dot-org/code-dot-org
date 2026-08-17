// Staged floating-guide instructions (the guide_steps level property): the
// pure step-advancement logic.

import {SpriteLab2Tab} from './redux/spriteLab2Redux';
import {SpriteLab2GuideStep} from './types';
import {WorldCell} from './world';

export interface WorldCounts {
  blocks: number;
  sprites: number;
}

// Placed World cells, tallied by kind.
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

// The step the guide should show: advance from `index` while the next step's
// `after` holds, every clause of it passing. Never retreats, and a step
// without `after` is never reached automatically.
export function nextGuideStepIndex(
  steps: SpriteLab2GuideStep[] | undefined,
  index: number,
  counts: WorldCounts,
  activeTab: SpriteLab2Tab
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
