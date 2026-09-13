// The premade world a level can hand a student: `world_start_pattern`, one
// string per playfield row, painted into the level's pinned scene.

import {useEffect} from 'react';

import {countWorldCells} from './guideSteps';
import {imageTypeFromCategories} from './imageGallery';
import {RuntimeAnimationList, Scene, Sources} from './types';
import {createEmptyWorld, sceneGridSize, World, WorldCell} from './world';

/**
 * Which image each pattern character draws. 'B' takes the block the student
 * made most recently, 'S' their first character — orderedKeys is newest-first,
 * because Sprite Lab prepends new animations.
 */
export function patternCells(animations: RuntimeAnimationList): {
  [char: string]: WorldCell;
} {
  const {orderedKeys, propsByKey} = animations;
  const typeOf = (key: string) =>
    imageTypeFromCategories(propsByKey[key]?.categories);
  const cells: {[char: string]: WorldCell} = {};
  const blockKey = orderedKeys.find(key => typeOf(key) === 'block');
  if (blockKey) {
    cells.B = {image: propsByKey[blockKey].name, kind: 'block'};
  }
  const spriteKey = [...orderedKeys]
    .reverse()
    .find(key => typeOf(key) === 'sprite');
  if (spriteKey) {
    cells.S = {image: propsByKey[spriteKey].name, kind: 'sprite'};
  }
  return cells;
}

/**
 * The scene's world with the pattern painted in, or null when it would change
 * nothing. Each kind seeds only while the world holds none of it, and only
 * into empty cells, so student edits always win and a later level's platforms
 * merge in around an already-placed player. Rows anchor to the playfield
 * floor, resizeWorld's convention.
 */
export function paintPattern(
  world: World | undefined,
  pattern: string[],
  cellFor: {[char: string]: WorldCell}
): World | null {
  const counts = countWorldCells(world?.grid);
  const size = sceneGridSize(world);
  const grid = (
    world?.grid?.length ? world.grid : createEmptyWorld(size).grid
  ).map(cells => [...cells]);
  const rowShift = size - pattern.length;
  let painted = false;
  pattern.forEach((rowText, patternRow) => {
    const row = patternRow + rowShift;
    if (row < 0 || row >= size) {
      return;
    }
    [...rowText].slice(0, size).forEach((char, col) => {
      const cell = cellFor[char];
      const placed = cell?.kind === 'block' ? counts.blocks : counts.sprites;
      if (!cell || placed > 0 || grid[row][col]) {
        return;
      }
      grid[row][col] = cell;
      painted = true;
    });
  });
  return painted ? {grid} : null;
}

/** Seeds the pattern once the images it draws with exist, and again after a
    Start Over, which empties the world. */
export function useWorldStartPattern({
  pattern,
  pinnedSceneId,
  enabled,
  animations,
  updateSources,
  reinitCount,
}: {
  pattern: string[] | undefined;
  pinnedSceneId: string | undefined;
  enabled: boolean;
  animations: RuntimeAnimationList;
  updateSources: (updater: (prev: Sources) => Sources) => void;
  reinitCount: number;
}): void {
  useEffect(() => {
    if (!pattern?.length || !pinnedSceneId || !enabled) {
      return;
    }
    const cellFor = patternCells(animations);
    updateSources(prev => {
      const scenes: Scene[] = prev.scenes ?? [];
      const index = scenes.findIndex(scene => scene.id === pinnedSceneId);
      if (index < 0) {
        return prev;
      }
      const world = paintPattern(scenes[index].world, pattern, cellFor);
      if (!world) {
        return prev;
      }
      const next = [...scenes];
      next[index] = {...scenes[index], world};
      return {...prev, scenes: next};
    });
  }, [pattern, pinnedSceneId, enabled, animations, updateSources, reinitCount]);
}
