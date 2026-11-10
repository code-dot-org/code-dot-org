// Sprite Lab 2's scene preload: what apps' SpriteLab2Engine did around
// P5Wrapper's preload.
import {
  animationNames,
  filterAnimationsToNames,
  loadedAnimations,
  trimAnimationListImages,
} from '../../imageTrim';
import type {RuntimeAnimationList} from '../../types';

import type {AnimationTable} from './AnimationTable';

/**
 * Loads the images a scene can use into `table`, cropping costumes first
 * (ANI-37), and drops every other entry. `referenced` holds the names the
 * scene's compile registered (imageReferences.ts); null loads them all.
 * Images whose data has not arrived are skipped.
 */
export async function preloadSceneImages(
  table: AnimationTable,
  list: RuntimeAnimationList,
  referenced: ReadonlySet<string> | null,
): Promise<void> {
  const scoped = referenced
    ? filterAnimationsToNames(list, new Set(referenced))
    : list;
  await loadTrimmed(table, scoped, list);
  table.prune(animationNames(scoped));
}

/**
 * Loads one image by name, mid-run, for a costume name the program built
 * at runtime. False when the list has no image of that name.
 */
export async function loadImageOnDemand(
  table: AnimationTable,
  list: RuntimeAnimationList,
  name: string,
): Promise<boolean> {
  const key = list.orderedKeys.find(k => list.propsByKey[k]?.name === name);
  if (!key) {
    return false;
  }
  const single = {
    orderedKeys: [key],
    propsByKey: {[key]: list.propsByKey[key]},
  };
  await loadTrimmed(table, single, list);
  return true;
}

async function loadTrimmed(
  table: AnimationTable,
  subset: RuntimeAnimationList,
  project: RuntimeAnimationList,
): Promise<void> {
  const trimmed = await trimAnimationListImages(
    subset,
    animationNames(project),
  );
  await table.load(loadedAnimations(trimmed));
}
