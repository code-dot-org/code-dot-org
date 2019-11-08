import {
  FishOceanObject,
  SeaCreatureOceanObject,
  TrashOceanObject
} from '../demo/OceanObject';
import {getState} from '../demo/state';
import {fishData} from './fishData';
import {filterFishComponents} from '../demo/helpers';
import _ from 'lodash';

/*
 * Generates a set of ocean objects of size numFish.
 * This function ensures an even number of bodies, eyes, mouths,
 * and color palettes over the set of FishOceanObjects.
 * If stateloadTrashImages is true it will make half of the objects
 * TrashOceanObjects.
 */
export const generateOcean = (
  numFish,
  loadFish = true,
  loadTrashImages,
  loadCreatureImages,
  idStart = 0
) => {
  const state = getState();
  let ocean = [];
  let possibleObjects = [];
  if (loadFish) {
    possibleObjects.push(FishOceanObject);
  }
  if (
    (loadTrashImages !== undefined && loadTrashImages) ||
    (loadTrashImages === undefined && state.loadTrashImages)
  ) {
    possibleObjects.push(TrashOceanObject);
  }
  if (
    (loadCreatureImages !== undefined && loadCreatureImages) ||
    (loadCreatureImages === undefined && state.loadCreatureImages)
  ) {
    possibleObjects.push(SeaCreatureOceanObject);
  }
  const possibleFishComponents = filterFishComponents(
    fishData,
    getState().appMode
  );
  let bodies = Object.values(possibleFishComponents.bodies);
  bodies = _.shuffle(bodies);
  let eyes = Object.values(possibleFishComponents.eyes);
  eyes = _.shuffle(eyes);
  let mouths = Object.values(possibleFishComponents.mouths);
  mouths = _.shuffle(mouths);
  let colorPalettes = Object.values(possibleFishComponents.colorPalettes);
  colorPalettes = _.shuffle(colorPalettes);
  for (var i = idStart; i < numFish + idStart; ++i) {
    const object = new possibleObjects[i % possibleObjects.length](
      i,
      possibleFishComponents
    );
    if (object instanceof FishOceanObject) {
      // For each of these components, use the next variation on the list
      // Reshuffle the list if we've reached the end to avoid any regularity.
      object.body = bodies[i % bodies.length];
      object.eye = eyes[i % eyes.length];
      object.mouth = mouths[i % mouths.length];
      object.colorPalette = colorPalettes[i % colorPalettes.length];
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
    if (i % colorPalettes.length === colorPalettes.length - 1) {
      colorPalettes = _.shuffle(colorPalettes);
    }

    object.randomize();
    ocean.push(object);
  }
  ocean = _.shuffle(ocean);
  return ocean;
};

export const filterOcean = async (ocean, trainer) => {
  const predictionPromises = [];
  ocean.forEach((fish, idx) => {
    if (!fish.getResult()) {
      predictionPromises.push(
        trainer.predictFromTensor(fish.getTensor()).then(res => {
          fish.setResult(res);
        })
      );
    }
  });
  await Promise.all(predictionPromises);
  return ocean;
};
