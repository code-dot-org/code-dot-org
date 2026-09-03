// Staged floating-guide instructions: the step-advancement logic, and the
// hook holding a level's position in it.

import {useEffect, useMemo, useState} from 'react';

import {ImageType} from './ai/images/types';
import {imageTypeFromCategories} from './imageGallery';
import {Tab} from './redux/spriteLab2Redux';
import {GuideStep, RuntimeAnimationList} from './types';
import {WorldCell} from './world';

export interface WorldCounts {
  blocks: number;
  sprites: number;
}

/** Project images tallied by kind. */
export type ImageCounts = Record<ImageType, number>;

export function countImagesByType(list: RuntimeAnimationList): ImageCounts {
  const counts: ImageCounts = {sprite: 0, background: 0, block: 0};
  list.orderedKeys.forEach(key => {
    counts[imageTypeFromCategories(list.propsByKey[key]?.categories)]++;
  });
  return counts;
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
  images: ImageCounts;
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
  const totalImages = images.sprite + images.background + images.block;
  let result = index;
  for (;;) {
    const after = steps?.[result + 1]?.after;
    if (
      !after ||
      (after.worldBlocks !== undefined && counts.blocks < after.worldBlocks) ||
      (after.worldSprites !== undefined &&
        counts.sprites < after.worldSprites) ||
      (after.images !== undefined && totalImages < after.images) ||
      (after.spriteImages !== undefined &&
        images.sprite < after.spriteImages) ||
      (after.backgroundImages !== undefined &&
        images.background < after.backgroundImages) ||
      (after.blockImages !== undefined && images.block < after.blockImages) ||
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
  images: ImageCounts;
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
