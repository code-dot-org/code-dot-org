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

/** What the step conditions are measured against. */
export interface GuideProgress {
  counts: WorldCounts;
  activeTab: Tab;
  images: number;
}

// The step the guide should show: advance from `index` while the next step's
// `after` holds, every clause of it passing. Never retreats, and a step
// without `after` is never reached automatically.
export function nextGuideStepIndex(
  steps: GuideStep[] | undefined,
  index: number,
  progress: GuideProgress
): number {
  const {counts, activeTab, images} = progress;
  let result = index;
  for (;;) {
    const after = steps?.[result + 1]?.after;
    if (
      !after ||
      (after.worldBlocks !== undefined && counts.blocks < after.worldBlocks) ||
      (after.worldSprites !== undefined &&
        counts.sprites < after.worldSprites) ||
      (after.images !== undefined && images < after.images) ||
      (after.tab !== undefined && after.tab !== activeTab)
    ) {
      return result;
    }
    result++;
  }
}

/** What the guide should show right now. */
export interface GuideDisplay {
  text?: string;
  /** The current step offers the Continue button to the next level. */
  showContinue: boolean;
}

/**
 * The guide content a level should show right now: the current step's, or the
 * level's plain instructions when it declares no steps. The position only ever
 * moves forward, so undoing work doesn't pull the instructions back.
 */
export function useGuideSteps({
  steps,
  grid,
  activeTab,
  images,
  fallback,
}: {
  steps: GuideStep[] | undefined;
  grid: (WorldCell | null)[][] | undefined;
  activeTab: Tab;
  images: number;
  fallback: string | undefined;
}): GuideDisplay {
  const counts = useMemo(() => countWorldCells(grid), [grid]);
  const [index, setIndex] = useState(0);
  useEffect(() => {
    setIndex(current =>
      nextGuideStepIndex(steps, current, {counts, activeTab, images})
    );
  }, [steps, counts, activeTab, images]);
  if (!steps?.length) {
    return {text: fallback, showContinue: false};
  }
  const step = steps[Math.min(index, steps.length - 1)];
  return {text: step.text, showContinue: !!step.showContinue};
}
