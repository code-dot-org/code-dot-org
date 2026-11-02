// Tallies of what a project holds: its images by kind, and its World cells.

import {ImageType} from './ai/images/types';
import {imageTypeFromCategories} from './imageGallery';
import {RuntimeAnimationList} from './types';
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

/** Images added since a baseline, clamped at zero: Start Over can drop the
    live count below what the level opened with. */
export function imageCountsDelta(
  now: ImageCounts,
  baseline: ImageCounts
): ImageCounts {
  return {
    sprite: Math.max(0, now.sprite - baseline.sprite),
    background: Math.max(0, now.background - baseline.background),
    block: Math.max(0, now.block - baseline.block),
  };
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
