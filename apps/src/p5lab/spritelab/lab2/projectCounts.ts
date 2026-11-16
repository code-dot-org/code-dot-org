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

/**
 * The AI-made images that count as made on a level: how many, by kind, and
 * whether the student has rated any of them. They are the images whose
 * names were not in the project when the level opened (`namesBefore`), and
 * the level's own image (`ownNames`, the ones carrying its role), whenever
 * it was made. A student who comes back to a level changes that image in
 * place, so it is never a new one.
 */
export function generatedOnLevel(
  list: RuntimeAnimationList,
  namesBefore: ReadonlySet<string>,
  ownNames: ReadonlySet<string>
): {generated: ImageCounts; rated: boolean} {
  const generated: ImageCounts = {sprite: 0, background: 0, block: 0};
  let rated = false;
  list.orderedKeys.forEach(key => {
    const props = list.propsByKey[key];
    if (
      props?.generation &&
      (!namesBefore.has(props.name) || ownNames.has(props.name))
    ) {
      generated[imageTypeFromCategories(props.categories)]++;
      rated ||= !!props.generation.verdict;
    }
  });
  return {generated, rated};
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
