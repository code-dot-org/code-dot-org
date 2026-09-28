// The premade world a level can hand a student, painted into its pinned scene.

import {useEffect} from 'react';

import {countWorldCells} from './guideSteps';
import {imageTypeFromCategories} from './imageGallery';
import {imageNamedForRole} from './imageRoleDefaults';
import {RuntimeAnimationList, Scene, Sources} from './types';
import {createEmptyWorld, sceneGridSize, World, WorldCell} from './world';

/**
 * Which image each pattern character draws: 'B' the block the student made
 * most recently, 'S' the sprite carrying spriteRole (the level's default
 * sprite), else their first character. orderedKeys is newest-first,
 * because Sprite Lab prepends new animations.
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
 * The layout a project gets from a level's world_start_pattern: the one
 * pattern given, or one of several chosen by the project's channel id, so
 * a class sees different worlds and one student sees the same world on
 * every level that seeds it. No channel (a levelbuilder preview) takes the
 * first.
 */
export function chooseStartPattern(
  pattern: string[] | string[][] | undefined,
  channelId: string | undefined
): string[] | undefined {
  if (!pattern?.length) {
    return undefined;
  }
  if (!Array.isArray(pattern[0])) {
    return pattern as string[];
  }
  const layouts = pattern as string[][];
  // A channel id is an encrypted string, so any one of its characters is
  // already evenly spread.
  const pick = channelId ? channelId.charCodeAt(channelId.length - 1) : 0;
  return layouts[pick % layouts.length];
}

/**
 * The scene's world with the pattern painted in, or null when it would change
 * nothing. Each kind seeds only while the world holds none of it, and only
 * into empty cells, so a student's own placements always win. Rows anchor to
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

/** Seeds the pattern whenever the image list changes. A trigger keyed on
    Start Over itself would fire with the pre-reset list. */
export function useWorldStartPattern({
  pattern: patternOrLayouts,
  channelId,
  pinnedSceneId,
  enabled,
  animations,
  spriteRole,
  updateSources,
}: {
  pattern: string[] | string[][] | undefined;
  channelId: string | undefined;
  pinnedSceneId: string | undefined;
  enabled: boolean;
  animations: RuntimeAnimationList;
  spriteRole?: string;
  updateSources: (updater: (prev: Sources) => Sources) => void;
}): void {
  useEffect(() => {
    const pattern = chooseStartPattern(patternOrLayouts, channelId);
    if (!pattern || !pinnedSceneId || !enabled) {
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
      return {...prev, scenes: next};
    });
  }, [
    patternOrLayouts,
    channelId,
    pinnedSceneId,
    enabled,
    animations,
    spriteRole,
    updateSources,
  ]);
}
