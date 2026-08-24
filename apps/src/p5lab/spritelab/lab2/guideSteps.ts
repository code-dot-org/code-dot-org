// Staged floating-guide instructions: the step-advancement logic, and the
// hook holding a level's position in it.

import {useEffect, useMemo, useState} from 'react';

import {Tab} from './redux/spriteLab2Redux';
import {GuideStep} from './types';
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
  steps: GuideStep[] | undefined,
  index: number,
  counts: WorldCounts,
  activeTab: Tab,
  imageCount: number
): number {
  let result = index;
  for (;;) {
    const after = steps?.[result + 1]?.after;
    if (
      !after ||
      (after.worldBlocks !== undefined && counts.blocks < after.worldBlocks) ||
      (after.worldSprite && counts.sprites === 0) ||
      (after.worldSprites !== undefined &&
        counts.sprites < after.worldSprites) ||
      (after.images !== undefined && imageCount < after.images) ||
      (after.tab !== undefined && after.tab !== activeTab)
    ) {
      return result;
    }
    result++;
  }
}

/**
 * The guide text a level should show right now: the current step's, or the
 * level's plain instructions when it declares no steps. The position only ever
 * moves forward, so undoing work doesn't pull the instructions back.
 */
export function useGuideSteps(
  steps: GuideStep[] | undefined,
  grid: (WorldCell | null)[][] | undefined,
  activeTab: Tab,
  imageCount: number,
  fallback: string | undefined
): string | undefined {
  const counts = useMemo(() => countWorldCells(grid), [grid]);
  const [index, setIndex] = useState(0);
  useEffect(() => {
    setIndex(current =>
      nextGuideStepIndex(steps, current, counts, activeTab, imageCount)
    );
  }, [steps, counts, activeTab, imageCount]);
  if (!steps?.length) {
    return fallback;
  }
  return steps[Math.min(index, steps.length - 1)].text;
}
