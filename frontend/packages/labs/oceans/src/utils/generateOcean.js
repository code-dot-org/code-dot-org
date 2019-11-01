import {FishOceanObject, TrashOceanObject} from '../demo/OceanObject';
import {getState} from '../demo/state';
import {fishData} from './fishData';
import {filterFishComponents} from '../demo/helpers';

/*
 * Generates a set of ocean objects of size numFish.
 * This function ensures an even number of bodies, eyes, mouths,
 * and color palettes over the set of FishOceanObjects.
 * If stateloadTrashImages is true it will make half of the objects
 * TrashOceanObjects.
 */
export const generateOcean = numFish => {
  const state = getState();
  const ocean = [];
  let possibleObjects = [FishOceanObject];
  if (state.loadTrashImages) {
    possibleObjects.push(TrashOceanObject);
  }
  const possibleFishComponents = filterFishComponents(
    fishData,
    getState().dataSet
  );
  let bodies = Object.values(possibleFishComponents.bodies);
  shuffleList(bodies);
  let eyes = Object.values(possibleFishComponents.eyes);
  shuffleList(eyes);
  let mouths = Object.values(possibleFishComponents.mouths);
  shuffleList(mouths);
  let colorPalettes = Object.values(possibleFishComponents.colorPalettes);
  shuffleList(colorPalettes);
  for (var i = 0; i < numFish; ++i) {
    const object = new possibleObjects[i % possibleObjects.length](i);
    if (object instanceof FishOceanObject) {
      // For each of these components, use the next variation on the list
      // Reshuffle the list if we've reached the end to avoid any regularity.
      object.body = bodies[i % bodies.length];
      if (i % bodies.length === bodies.length - 1) {
        shuffleList(bodies);
      }
      object.eye = eyes[i % eyes.length];
      if (i % eyes.length === eyes.length - 1) {
        shuffleList(eyes);
      }
      object.mouth = mouths[i % mouths.length];
      if (i % mouths.length === mouths.length) {
        shuffleList(mouths);
      }
      object.colorPalette = colorPalettes[i % colorPalettes.length];
      if (i % colorPalettes.length === colorPalettes.length - 1) {
        shuffleList(colorPalettes);
      }
    }
    object.randomize();
    ocean.push(object);
  }
  shuffleList(ocean);
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

/*
 * Takes a list and shuffles it in place
 */
const shuffleList = list => {
  for (var i = 0; i < list.length; ++i) {
    const nextIdx = Math.floor(Math.random() * (list.length - i)) + i;
    const tmp = list[i];
    list[i] = list[nextIdx];
    list[nextIdx] = tmp;
  }
};
