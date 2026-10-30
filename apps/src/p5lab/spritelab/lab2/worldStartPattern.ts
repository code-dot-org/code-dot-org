// The premade world a level can hand a student, painted into its pinned scene.

import {useEffect, useState} from 'react';

import {imageTypeFromCategories} from './imageGallery';
import {imageNamedForRole} from './imageRoleDefaults';
import {countWorldCells} from './projectCounts';
import {RuntimeAnimationList, Scene, Sources} from './types';
import {createEmptyWorld, sceneGridSize, World, WorldCell} from './world';

/**
 * Which image each pattern character draws: 'B' the block the student made
 * most recently, 'S' the sprite carrying spriteRole (the level's default
 * sprite), else their first character. orderedKeys is newest-first, because
 * Sprite Lab prepends new animations.
 */
export function patternCells(
  animations: RuntimeAnimationList,
  spriteRole?: string
): {[char: string]: WorldCell} {
  const {orderedKeys, propsByKey} = animations;
  const typeOf = (key: string) =>
    imageTypeFromCategories(propsByKey[key]?.categories);
  const cells: {[char: string]: WorldCell} = {};
  const blockKey = orderedKeys.find(key => typeOf(key) === 'block');
  if (blockKey) {
    cells.B = {image: propsByKey[blockKey].name, kind: 'block'};
  }
  const roleName = imageNamedForRole(animations, 'sprite', spriteRole);
  const spriteKey = [...orderedKeys]
    .reverse()
    .find(key => typeOf(key) === 'sprite');
  const spriteName = roleName ?? (spriteKey && propsByKey[spriteKey].name);
  if (spriteName) {
    cells.S = {image: spriteName, kind: 'sprite'};
  }
  return cells;
}

/**
 * The scene's world with the pattern painted in, or null when it would change
 * nothing. Each kind seeds only while the world holds none of it, and only
 * into empty cells, so a student's own placements always win. One exception:
 * while the world has no blocks yet, a sprite the pattern names that occurs
 * exactly once in the grid, off its mark, is moved onto it. Rows anchor to
 * the playfield floor, resizeWorld's convention.
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
      if (!cell || grid[row][col]) {
        return;
      }
      const placed = cell.kind === 'block' ? counts.blocks : counts.sprites;
      if (placed > 0) {
        const from =
          cell.kind === 'sprite' &&
          counts.blocks === 0 &&
          soleCellOf(grid, cell);
        if (!from) {
          return;
        }
        grid[from.row][from.col] = null;
      }
      grid[row][col] = cell;
      painted = true;
    });
  });
  return painted ? {grid} : null;
}

/** Where the one cell showing this image sits, or null when the grid holds
    none or more than one. */
function soleCellOf(
  grid: (WorldCell | null)[][],
  cell: WorldCell
): {row: number; col: number} | null {
  const found: {row: number; col: number}[] = [];
  grid.forEach((cells, row) =>
    cells.forEach((c, col) => {
      if (c?.image === cell.image && c.kind === cell.kind) {
        found.push({row, col});
      }
    })
  );
  return found.length === 1 ? found[0] : null;
}

/** Seeds the pattern whenever the image list changes. A trigger keyed on
    Start Over itself would fire with the pre-reset list. */
export function useWorldStartPattern({
  pattern,
  pinnedSceneId,
  enabled,
  animations,
  spriteRole,
  updateSources,
}: {
  pattern: string[] | undefined;
  pinnedSceneId: string | undefined;
  enabled: boolean;
  animations: RuntimeAnimationList;
  spriteRole?: string;
  updateSources: (updater: (prev: Sources) => Sources) => void;
}): World | null {
  // The world as the pattern painted it: the baseline a level's "changed"
  // check compares the student's edits against.
  const [painted, setPainted] = useState<World | null>(null);
  useEffect(() => {
    if (!pattern?.length || !pinnedSceneId || !enabled) {
      return;
    }
    const cellFor = patternCells(animations, spriteRole);
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
      setPainted(world);
      return {...prev, scenes: next};
    });
  }, [pattern, pinnedSceneId, enabled, animations, spriteRole, updateSources]);
  return painted;
}
