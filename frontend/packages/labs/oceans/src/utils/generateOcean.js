import {fish} from './fishData';
//const _ = require('lodash');

export const generateRandomFish = () => {
  const bodies = Object.values(fish.bodies);
  const eyes = Object.values(fish.eyes);
  const mouths = Object.values(fish.mouths);
  const sideFins = Object.values(fish.sideFins);
  const topFins = Object.values(fish.topFins);
  const tails = Object.values(fish.tails);
  const colorPalettes = Object.values(fish.colorPalettes);

  const body = bodies[Math.floor(Math.random() * bodies.length)];
  const eye = eyes[Math.floor(Math.random() * eyes.length)];
  const mouth = mouths[Math.floor(Math.random() * mouths.length)];
  const sideFin = sideFins[Math.floor(Math.random() * sideFins.length)];
  const topFin = topFins[Math.floor(Math.random() * topFins.length)];
  const tail = tails[Math.floor(Math.random() * tails.length)];
  const colorPalette =
    colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
  const knnData = [
    ...body.knnData,
    ...eye.knnData,
    ...mouth.knnData,
    ...sideFin.knnData,
    ...topFin.knnData,
    ...tail.knnData,
    ...colorPalette.knnData
  ];

  return {
    parts: [body, eye, mouth, sideFin, topFin, tail],
    colorPalette,
    knnData
  };
};

export const generateOcean = numFish => {
  const ocean = [];
  for (var i = 0; i < numFish; ++i) {
    ocean.push(generateRandomFish());
  }
  return ocean;
};

export const filterOcean = async (ocean, trainer) => {
  const predictionPromises = [];
  ocean.forEach((fish, idx) => {
    predictionPromises.push(
      trainer.predictFromData(fish.knnData).then(res => {
        fish.result = res;
      })
    );
  });
  await Promise.all(predictionPromises);
  return ocean;
};
