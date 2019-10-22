import {fishData} from './fishData';

export const generateRandomFish = id => {
  const fish = fishData;

  const bodies = Object.values(fish.bodies);
  const eyes = Object.values(fish.eyes);
  const mouths = Object.values(fish.mouths);
  const sideFinsFront = Object.values(fish.pectoralFinsFront);
  const sideFinsBack = Object.values(fish.pectoralFinsBack);
  const topFins = Object.values(fish.topFins);
  const tails = Object.values(fish.tails);
  const colorPalettes = Object.values(fish.colorPalettes);

  const body = bodies[Math.floor(Math.random() * bodies.length)];
  const eye = eyes[Math.floor(Math.random() * eyes.length)];
  const mouth = mouths[Math.floor(Math.random() * mouths.length)];
  const finIdx = Math.floor(Math.random() * sideFinsFront.length);
  const sideFinFront = sideFinsFront[finIdx];
  const sideFinBack = sideFinsBack[finIdx];
  const topFin = topFins[Math.floor(Math.random() * topFins.length)];
  const tail = tails[Math.floor(Math.random() * tails.length)];
  const colorPalette =
    colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
  const knnData = [
    ...body.knnData,
    ...eye.knnData,
    ...mouth.knnData,
    ...sideFinFront.knnData,
    ...sideFinBack.knnData,
    ...topFin.knnData,
    ...tail.knnData,
    ...colorPalette.knnData
  ];

  return {
    id,
    parts: [body, eye, mouth, sideFinFront, sideFinBack, topFin, tail],
    colorPalette,
    knnData
  };
};

export const generateOcean = numFish => {
  const ocean = [];
  for (var i = 0; i < numFish; ++i) {
    ocean.push(generateRandomFish(i));
  }
  return ocean;
};

export const filterOcean = async (ocean, trainer) => {
  const predictionPromises = [];
  ocean.forEach((fish, idx) => {
    if (!fish.result) {
      predictionPromises.push(
        trainer.predictFromData(fish.knnData).then(res => {
          fish.result = res;
        })
      );
    }
  });
  await Promise.all(predictionPromises);
  return ocean;
};
