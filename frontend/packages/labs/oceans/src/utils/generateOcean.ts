import _ from 'lodash';

import {filterFishComponents, generateColorPalette} from '../oceans/helpers';
import {
  FishOceanObject,
  OceanObject,
  SeaCreatureOceanObject,
  TrashOceanObject,
} from '../oceans/OceanObject';
import {getState} from '../oceans/state';

import {fishData} from './fishData';

/**
 * Generate a set of OceanObjects of size numFish.
 *
 * Ensures an even distribution of bodies, eyes, mouths, and color palettes
 * across the generated FishOceanObjects. When loadTrashImages or
 * loadCreatureImages is true the set will also include TrashOceanObjects
 * and/or SeaCreatureOceanObjects.
 *
 * @param numFish - Total number of objects to generate.
 * @param idStart - Numeric ID to assign to the first generated object.
 * @param loadFish - When true, FishOceanObjects are included in the pool.
 * @param loadTrashImages - Override state.loadTrashImages when defined.
 * @param loadCreatureImages - Override state.loadCreatureImages when defined.
 * @returns Array of newly randomized OceanObject instances.
 */
export const generateOcean = (
  numFish: number,
  idStart = 0,
  loadFish = true,
  loadTrashImages?: boolean,
  loadCreatureImages?: boolean,
): OceanObject[] => {
  const state = getState();
  let ocean: OceanObject[] = [];
  const possibleObjects: Array<
    new (id: number, ...args: unknown[]) => OceanObject
  > = [];
  if (loadFish) {
    possibleObjects.push(
      FishOceanObject as unknown as new (
        id: number,
        ...args: unknown[]
      ) => OceanObject,
    );
  }
  if (
    (loadTrashImages !== undefined && loadTrashImages) ||
    (loadTrashImages === undefined && state.loadTrashImages)
  ) {
    possibleObjects.push(
      TrashOceanObject as unknown as new (
        id: number,
        ...args: unknown[]
      ) => OceanObject,
    );
  }
  if (
    (loadCreatureImages !== undefined && loadCreatureImages) ||
    (loadCreatureImages === undefined && state.loadCreatureImages)
  ) {
    possibleObjects.push(
      SeaCreatureOceanObject as unknown as new (
        id: number,
        ...args: unknown[]
      ) => OceanObject,
    );
  }

  const possibleFishComponents = filterFishComponents(
    fishData as unknown as Record<
      string,
      Record<string, {exclusions?: string[]}>
    >,
    getState().appMode,
  );
  let bodies = _.shuffle(Object.values(possibleFishComponents.bodies));
  let eyes = _.shuffle(Object.values(possibleFishComponents.eyes));
  let mouths = _.shuffle(Object.values(possibleFishComponents.mouths));
  let colors = _.shuffle(
    Object.values(possibleFishComponents.colors),
  ) as Array<{rgb: number[]; knnData: number[]; fieldInfos: unknown[]}>;

  for (let i = idStart; i < numFish + idStart; ++i) {
    const object = new possibleObjects[i % possibleObjects.length](
      i,
      possibleFishComponents,
    );
    if (object instanceof FishOceanObject) {
      // For each of these components, use the next variation on the list.
      // Reshuffle the list if we've reached the end to avoid any regularity.
      object.body = bodies[i % bodies.length];
      object.eye = eyes[i % eyes.length];
      object.mouth = mouths[i % mouths.length];
      const bodyIdx = i % colors.length;
      object.colorPalette = generateColorPalette(colors, bodyIdx);
    }

    if (i % bodies.length === bodies.length - 1) {
      bodies = _.shuffle(bodies);
    }
    if (i % eyes.length === eyes.length - 1) {
      eyes = _.shuffle(eyes);
    }
    if (i % mouths.length === mouths.length - 1) {
      mouths = _.shuffle(mouths);
    }
    if (i % colors.length === colors.length - 1) {
      colors = _.shuffle(colors);
    }

    object.randomize();
    ocean.push(object);
  }
  ocean = _.shuffle(ocean);
  return ocean;
};

/**
 * Run predictions on any un-evaluated objects in the ocean array.
 *
 * @param ocean - Array of OceanObjects to evaluate.
 * @param trainer - Trainer instance with a predict method.
 * @returns The same array, with results attached to each object.
 */
export const filterOcean = async (
  ocean: OceanObject[],
  trainer: {predict: (fish: OceanObject) => Promise<unknown>},
): Promise<OceanObject[]> => {
  const predictionPromises: Promise<void>[] = [];
  ocean.forEach(fish => {
    if (!fish.getResult()) {
      predictionPromises.push(
        trainer.predict(fish).then(res => {
          fish.setResult(res);
        }),
      );
    }
  });
  await Promise.all(predictionPromises);
  return ocean;
};
