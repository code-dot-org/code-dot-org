const {initFishData, fishData, MouthExpression} = require('../../src/utils/fishData');
const {generateOcean, filterOcean} = require('../../src/utils/generateOcean');
const SimpleTrainer = require('../../src/utils/SimpleTrainer');


const trial = async function(trainSize, testSize, trainer, labelFn) {
  const trainingOcean = generateOcean(trainSize);
  const trainingLabels = trainingOcean.map(fish => labelFn(fish));

  const testOcean = generateOcean(testSize);
  const testData = testOcean.map(fish => fish.knnData);

  for (const fish of trainingOcean) {
    const label = labelFn(fish);
    trainer.addTrainingExample(fish.knnData, label);
  };

  trainer.train();

  for (const fish of testOcean) {
    fish.result = await trainer.predictFromExample(fish.knnData);
  }

  return createConfusionMatrix(testOcean, trainSize, labelFn);
};

const average = function(list) {
  const sum = list.reduce((prev, curr) => prev + curr);
  return (1.0 * sum / list.length);
};

const performTrials = async function({numTrials, trainSize, testSize, createTrainerFn, labelFn}) {
  const trials = [];

  if (!createTrainerFn) {
    createTrainerFn = () => {
      const trainer = new SimpleTrainer();
      trainer.initializeClassifiersWithoutMobilenet();
      return trainer;
    };
  }

  //console.log(`${numTrials} trials`);
  for (var i = 0; i < numTrials; i++) {
    //console.log(`Trial # ${i + 1}`);
    trials.push(await trial(trainSize, testSize, createTrainerFn(), labelFn));
  }

  const averagedConfusionMatrix = {};
  const keys = ['truePos', 'falsePos', 'falseNeg', 'trueNeg', 'precision', 'recall', 'accuracy'];

  for (const key of keys) {
    //console.log(`${key} ${JSON.stringify(resultsForCurrentNumberOfTrials.map(result => result[key]))}`)
    const values = trials.map(t => t[key]);
    const avg = average(values);
    averagedConfusionMatrix[key] = avg;
  }

  return averagedConfusionMatrix;
};

const createConfusionMatrix = function(predictedOcean, numTrained, labelFn) {
  //const confusionMatrix = {truePos: 0, falsePos: 0, falseNeg: 0, trueNeg: 0}
  var truePos, falsePos, falseNeg, trueNeg;
  truePos = falsePos = falseNeg = trueNeg = 0;

  for (const fish of predictedOcean) {
    const actualLabel = labelFn(fish);
    const prediction = fish.result.predictedClassId;

    if (prediction && actualLabel) {
      truePos++;
    } else if (prediction && !actualLabel) {
      falsePos++;
    } else if (!prediction && actualLabel) {
      falseNeg++;
    } else {
      trueNeg++;
    }
  };

  const totalSize = truePos + falsePos + falseNeg + trueNeg;

  const precision = truePos / (truePos + falsePos);
  const recall = truePos / (truePos + falseNeg);
  const accuracy = (truePos + trueNeg) / totalSize;

  const confusionMatrix = {
    truePos: truePos,
    falsePos: falsePos,
    falseNeg: falseNeg,
    trueNeg: trueNeg,
    // If the model didn't predict "yes" for anything in the test data, precision is NaN.
    // We can assume there was at least one positive in the test data and call this 0 precision.
    precision: precision || 0,
    recall: recall,
    accuracy: accuracy
  };

  return confusionMatrix;
};

const analyzeConfusionMatrix = function(numTrained, cMatrix) {
  console.log(`Num Trained: ${numTrained} Precision: ${cMatrix.precision.toFixed(2)} Recall: ${cMatrix.recall.toFixed(2)} Accuracy: ${cMatrix.accuracy.toFixed(2)}\n` +
    `True Pos: ${cMatrix.truePos.toFixed(2)}\tFalse Pos: ${cMatrix.falsePos.toFixed(2)}\n` +
    `False Neg: ${cMatrix.falseNeg.toFixed(2)} True Neg: ${cMatrix.trueNeg.toFixed(2)}\n`);
};

const floatEquals = (a, b) => {
  return Math.abs(a - b) <= .0001;
};

const PartKey = Object.freeze({
  BODY: 'body',
  EYE: 'eye',
  MOUTH: 'mouth',
  PECTORAL_FIN_FRONT: 'pectoralFinFront',
  DORSAL_FIN: 'dorsalFin',
  TAIL: 'tail',
  COLOR: 'colorPalette'
});

const NUM_TRIALS = 5;
const TRAIN_SIZE = 100;

describe('Model quality test', () => {
  beforeAll(() => {
    initFishData();
  });

  test('Round fish quality test', async () => {
    const roundFishFn = (fish) => fish.body.knnData[1] === 0 ? 1 : 0;
    const trainSize = TRAIN_SIZE;

    const result = await performTrials({
      numTrials: NUM_TRIALS,
      trainSize: trainSize,
      testSize: 100,
      labelFn: roundFishFn
    });
    analyzeConfusionMatrix(trainSize, result);
  });


  test('test eyes', async () => {
    const partData = fishData.eyes;
    const partKey = PartKey.EYE;
    const trainSize = TRAIN_SIZE;

    for (const [name, data] of Object.entries(partData)) {
      console.log(name);
      const id = data.index;
      const labelFn = (fish) => fish[partKey].index === id ? 1 : 0;
      const result = await performTrials({
        numTrials: NUM_TRIALS,
        trainSize: trainSize,
        testSize: 100,
        labelFn: labelFn
      });
      analyzeConfusionMatrix(trainSize, result);
    }
  });


  test('test mouths', async () => {
    const partData = fishData.mouths;
    const partKey = PartKey.MOUTH;    
    const trainSize = TRAIN_SIZE;

    for (const [name, data] of Object.entries(partData)) {
      console.log(name);
      const id = data.index;
      const labelFn = (fish) => fish[partKey].index === id ? 1 : 0;
      const result = await performTrials({
        numTrials: NUM_TRIALS,
        trainSize: trainSize,
        testSize: 100,
        labelFn: labelFn
      });
      analyzeConfusionMatrix(trainSize, result);
    }
  });


  test('test tails', async () => {
    const partData = fishData.tails;
    const partKey = PartKey.TAIL;
    const trainSize = TRAIN_SIZE;

    for (const [name, data] of Object.entries(partData)) {
      console.log(name);
      const id = data.index;
      const labelFn = (fish) => fish[partKey].index === id ? 1 : 0;
      const result = await performTrials({
        numTrials: NUM_TRIALS,
        trainSize: trainSize,
        testSize: 100,
        labelFn: labelFn
      });
      analyzeConfusionMatrix(trainSize, result);
    }
  });


  test('test mouth expressions', async () => {
    const partKey = PartKey.MOUTH;
    const knnDataIndex = 2;
    const trainSize = TRAIN_SIZE;

    for (const [expressionName, expressionId] of Object.entries(MouthExpression)) {
      console.log(`${expressionName}`);
      const normalizedId = (1.0 * expressionId) / (Object.keys(MouthExpression).length - 1);
      const labelFn = (fish) => floatEquals(fish[partKey].knnData[knnDataIndex], normalizedId) ? 1 : 0;
      const result = await performTrials({
        numTrials: NUM_TRIALS,
        trainSize: trainSize,
        testSize: 100,
        labelFn:
        labelFn
      });
      analyzeConfusionMatrix(trainSize, result);
    }
  });


  test('test shark teeth', async () => {
    const partData = fishData.mouths;
    const partKey = PartKey.MOUTH;
    const trainSize = TRAIN_SIZE;
    const mouthNames = ['sharp1', 'spikey1'];

    const ids = Object.entries(partData).filter(entry => mouthNames.includes(entry[0])).map(entry => entry[1].index);
    console.log(`mouth names: ${JSON.stringify(mouthNames)} ids: ${JSON.stringify(ids)}`);

    const labelFn = (fish) => ids.includes(fish[partKey].index) ? 1 : 0;
    const result = await performTrials({
      numTrials: NUM_TRIALS,
      trainSize: trainSize,
      testSize: 100,
      labelFn: labelFn
    });
    analyzeConfusionMatrix(trainSize, result);
  });

});
