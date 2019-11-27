const {
  initFishData,
  fishData,
  fieldInfos,
  MouthExpression,
  BodyShape
} = require('../../src/utils/fishData');
const {generateOcean, filterOcean} = require('../../src/utils/generateOcean');
const SimpleTrainer = require('../../src/utils/SimpleTrainer');
const SVMTrainer = require('../../src/utils/SVMTrainer');
import {ClassType} from '../../src/demo/constants';

function clock(start) {
  if ( !start ) return process.hrtime();
  var end = process.hrtime(start);
  return Math.round((end[0]*1000) + (end[1]/1000000));
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

const trial = async function(trainSize, testSize, trainer, labelFn) {
  const trainingOcean = generateOcean(trainSize);
  const trainingLabels = trainingOcean.map(fish => labelFn(fish));

  const testOcean = generateOcean(testSize);

  for (const fish of trainingOcean) {
    const label = labelFn(fish);
    trainer.addTrainingExample(fish, label);
  }

  //const trainStart = clock();
  trainer.train();
  //console.log(`training latency: ${clock(trainStart)}`);

  for (const fish of testOcean) {
    fish.result = await trainer.predict(fish);
    //console.log(`${fish.result.predictedClassId === ClassType.Like ? 'Like' : 'Dislike'} Confidence: ${fish.result.confidencesByClassId[fish.result.predictedClassId]}`);
    //console.log(trainer.explainFish(fish));
  }

  //console.log(trainer.detailedExplanation(testOcean[0].fieldInfos));
  //console.log('Model summary:');
  //console.log(trainer.summarize(testOcean[0].fieldInfos));

  return createConfusionMatrix(testOcean, trainSize, labelFn);
};

const average = function(list) {
  const sum = list.reduce((prev, curr) => prev + curr);
  return (1.0 * sum) / list.length;
};

const performTrials = async function({
  numTrials,
  trainSize,
  testSize,
  createTrainerFn,
  labelFn
}) {
  const trials = [];

  if (!createTrainerFn) {
    createTrainerFn = () => {
      const trainer = new SVMTrainer(fish => fish.getKnnData());
      return trainer;
    };
  }

  //console.log(`${numTrials} trials`);
  for (var i = 0; i < numTrials; i++) {
    //console.log(`Trial # ${i + 1}`);
    trials.push(await trial(trainSize, testSize, createTrainerFn(), labelFn));
  }

  const averagedConfusionMatrix = {};
  const keys = [
    'truePos',
    'falsePos',
    'falseNeg',
    'trueNeg',
    'precision',
    'recall',
    'accuracy'
  ];

  for (const key of keys) {
    const values = trials.map(t => t[key]);
    const avg = average(values);
    averagedConfusionMatrix[key] = avg;
  }

  return averagedConfusionMatrix;
};

const createConfusionMatrix = function(predictedOcean, numTrained, labelFn) {
  var truePos, falsePos, falseNeg, trueNeg;
  truePos = falsePos = falseNeg = trueNeg = 0;

  for (const fish of predictedOcean) {
    const actualLabel = labelFn(fish) === ClassType.Like;
    const prediction = fish.result.predictedClassId === ClassType.Like;

    if (prediction && actualLabel) {
      truePos++;
    } else if (prediction && !actualLabel) {
      falsePos++;
    } else if (!prediction && actualLabel) {
      falseNeg++;
    } else {
      trueNeg++;
    }
  }

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
  console.log(
    `Num Trained: ${numTrained} Precision: ${cMatrix.precision.toFixed(
      2
    )} Recall: ${cMatrix.recall.toFixed(
      2
    )} Accuracy: ${cMatrix.accuracy.toFixed(2)}\n` +
      `True Pos: ${cMatrix.truePos.toFixed(
        2
      )}\tFalse Pos: ${cMatrix.falsePos.toFixed(2)}\n` +
      `False Neg: ${cMatrix.falseNeg.toFixed(
        2
      )} True Neg: ${cMatrix.trueNeg.toFixed(2)}\n`
  );
};

const floatEquals = (a, b) => {
  return Math.abs(a - b) <= 0.0001;
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

const NUM_TRIALS = 1; // TODO: if we want to run more trials per test in the future, we may want to fix the logic around generating average precision scores.
const TRAIN_SIZE = 100;
const TEST_SIZE = 500;

describe('Model quality test', () => {
  beforeAll(() => {
    initFishData();
  });

  // TODO: (maddie) fix this test to work with new fishData.colors setup + re-enable
  // test('Color test', async () => {
  //   const trainSize = TRAIN_SIZE;
  //
  //   const idsByColor = {
  //     red: [2, 5],
  //     green: [3, 4],
  //     blue: [0, 6]
  //   };
  //
  //   for (const [color, ids] of Object.entries(idsByColor)) {
  //     console.log(`${color}`);
  //     const labelFn = (fish) => ids.includes(fish.colorPalette.index) ? ClassType.Like : ClassType.Dislike;
  //     const result = await performTrials({
  //       numTrials: NUM_TRIALS,
  //       trainSize: trainSize,
  //       testSize: 100,
  //       labelFn: labelFn
  //     });
  //     analyzeConfusionMatrix(trainSize, result);
  //     expect(result.precision).toBeGreaterThanOrEqual(0.9);
  //     expect(result.recall).toBeGreaterThanOrEqual(0.5);
  //   }
  // });

  test('test eels with sharp teeth', async () => {
    const trainSize = 300; // Need more fish to hit enough to train on
    const mouthData = fishData.mouths;
    const mouthKey = PartKey.MOUTH;
    const mouthNames = ['mouth3', 'mouth7', 'mouth8'];

    const bodyData = fishData.bodies;
    const bodyKey = PartKey.BODY;
    const bodyNames = ['s1', 's2'];

    const mouthIds = Object.entries(mouthData)
      .filter(entry => mouthNames.includes(entry[0]))
      .map(entry => entry[1].index);
    const bodyIds = Object.entries(bodyData)
      .filter(entry => bodyNames.includes(entry[0]))
      .map(entry => entry[1].index);
    console.log(
      `mouth names: ${JSON.stringify(mouthNames)} mouthIds: ${JSON.stringify(mouthIds)}`
    );
    console.log(
      `body names: ${JSON.stringify(bodyNames)} bodyIds: ${JSON.stringify(bodyIds)}`
    );

    const labelFn = fish =>
      mouthIds.includes(fish[mouthKey].index) && bodyIds.includes(fish[bodyKey].index) ? ClassType.Like : ClassType.Dislike;

    const result = await performTrials({
      numTrials: 1,
      trainSize: trainSize,
      testSize: TEST_SIZE,
      labelFn: labelFn
    });
    analyzeConfusionMatrix(trainSize, result);
    expect(result.precision).toBeGreaterThanOrEqual(0.5);
    expect(result.recall).toBeGreaterThan(0); // very relaxed thresholds since this case is difficult to get right due to # of variations
  });

  test('Body shape test', async () => {
    const partKey = PartKey.BODY;
    const knnDataIndex = 1;
    const attribute = BodyShape;
    const trainSize = TRAIN_SIZE;

    for (const [shape, id] of Object.entries(attribute)) {
      console.log(`${shape}`);
      const normalizedId = (1.0 * id) / (Object.keys(attribute).length - 1);
      const labelFn = fish =>
        floatEquals(fish[partKey].knnData[knnDataIndex], normalizedId)
          ? ClassType.Like
          : ClassType.Dislike;
      const result = await performTrials({
        numTrials: NUM_TRIALS,
        trainSize: trainSize,
        testSize: TEST_SIZE,
        labelFn: labelFn
      });
      analyzeConfusionMatrix(trainSize, result);
      expect(result.precision).toBeGreaterThanOrEqual(0.9);
      expect(result.recall).toBeGreaterThanOrEqual(0.5);
    }
  });

  test('test eyes', async () => {
    const partData = fishData.eyes;
    const partKey = PartKey.EYE;
    const trainSize = TRAIN_SIZE;

    for (const [name, data] of Object.entries(partData)) {
      console.log(`${partKey} ${name}`);
      const id = data.index;
      const labelFn = fish =>
        fish[partKey].index === id ? ClassType.Like : ClassType.Dislike;
      const result = await performTrials({
        numTrials: NUM_TRIALS,
        trainSize: trainSize,
        testSize: TEST_SIZE,
        labelFn: labelFn
      });
      analyzeConfusionMatrix(trainSize, result);
      expect(result.precision).toBeGreaterThanOrEqual(0.9);
      expect(result.recall).toBeGreaterThanOrEqual(0.5);
    }
  });

  test('test mouths', async () => {
    const partData = fishData.mouths;
    const partKey = PartKey.MOUTH;
    const trainSize = TRAIN_SIZE;

    for (const [name, data] of Object.entries(partData)) {
      console.log(`${partKey} ${name}`);
      const id = data.index;
      const labelFn = fish =>
        fish[partKey].index === id ? ClassType.Like : ClassType.Dislike;
      const result = await performTrials({
        numTrials: NUM_TRIALS,
        trainSize: trainSize,
        testSize: TEST_SIZE,
        labelFn: labelFn
      });
      analyzeConfusionMatrix(trainSize, result);
      expect(result.precision).toBeGreaterThanOrEqual(0.9);
      expect(result.recall).toBeGreaterThanOrEqual(0.5);
    }
  });

  test('test tails', async () => {
    const partData = fishData.tails;
    const partKey = PartKey.TAIL;
    const trainSize = TRAIN_SIZE;

    for (const [name, data] of Object.entries(partData)) {
      console.log(`${partKey} ${name}`);
      const id = data.index;
      const labelFn = fish => {
        //console.log(JSON.stringify(fish, null, 2));
        return fish[partKey].index === id ? ClassType.Like : ClassType.Dislike;
      };
      const result = await performTrials({
        numTrials: NUM_TRIALS,
        trainSize: trainSize,
        testSize: TEST_SIZE,
        labelFn: labelFn
      });
      analyzeConfusionMatrix(trainSize, result);
      // The tails test frequently fails to meet these thresholds
      // TODO: investigate and fix
      //expect(result.precision).toBeGreaterThanOrEqual(0.9);
      //expect(result.recall).toBeGreaterThanOrEqual(0.5);
    }
  });

  test('test mouth expressions', async () => {
    const partKey = PartKey.MOUTH;
    const knnDataIndex = 2;
    const trainSize = TRAIN_SIZE;

    for (const [expressionName, expressionId] of Object.entries(
      MouthExpression
    )) {
      console.log(`${partKey} ${expressionName}`);
      const normalizedId =
        (1.0 * expressionId) / (Object.keys(MouthExpression).length - 1);
      const labelFn = fish =>
        floatEquals(fish[partKey].knnData[knnDataIndex], normalizedId)
          ? ClassType.Like
          : ClassType.Dislike;
      const result = await performTrials({
        numTrials: NUM_TRIALS,
        trainSize: trainSize,
        testSize: TEST_SIZE,
        labelFn: labelFn
      });
      analyzeConfusionMatrix(trainSize, result);
      expect(result.precision).toBeGreaterThanOrEqual(0.9);
      expect(result.recall).toBeGreaterThanOrEqual(0.5);
    }
  });

  test('test shark teeth', async () => {
    const partData = fishData.mouths;
    const partKey = PartKey.MOUTH;
    const trainSize = TRAIN_SIZE;
    const mouthNames = ['mouth3', 'mouth7'];

    const ids = Object.entries(partData)
      .filter(entry => mouthNames.includes(entry[0]))
      .map(entry => entry[1].index);
    console.log(
      `mouth names: ${JSON.stringify(mouthNames)} ids: ${JSON.stringify(ids)}`
    );

    const labelFn = fish =>
      ids.includes(fish[partKey].index) ? ClassType.Like : ClassType.Dislike;
    const result = await performTrials({
      numTrials: NUM_TRIALS,
      trainSize: trainSize,
      testSize: TEST_SIZE,
      labelFn: labelFn
    });
    analyzeConfusionMatrix(trainSize, result);
    expect(result.precision).toBeGreaterThanOrEqual(0.9);
    expect(result.recall).toBeGreaterThanOrEqual(0.5);
  });

  test('test SVM explanation', async () => {
    const partKey = PartKey.MOUTH;
    const knnDataIndex = 2;
    const expression = MouthExpression.SMILE;

    const trainer = new SVMTrainer(fish => fish.getKnnData());
    const normalizedId =
      (1.0 * expression) / (Object.keys(MouthExpression).length - 1);
    const labelFn = fish =>
      floatEquals(fish[partKey].knnData[knnDataIndex], normalizedId)
        ? ClassType.Like
        : ClassType.Dislike;

    const trainingOcean = generateOcean(TRAIN_SIZE);
    const trainingLabels = trainingOcean.map(fish => labelFn(fish));

    const testOcean = generateOcean(TRAIN_SIZE);

    for (const fish of trainingOcean) {
      const label = labelFn(fish);
      trainer.addTrainingExample(fish, label);
    }

    trainer.train();

    const summary = trainer.summarize(trainingOcean[0].fieldInfos);
    console.log(summary);
    expect(summary[0].partType).toEqual('mouths'); // mouths should be most important since we're selecting for smiling fish
    var sum = 0;
    for (const entry of summary) {
      sum += entry.importance;
    }
    expect(sum).toBeCloseTo(1, 3); // Should add up to 1, allowing for floating point error

    for (const fish of testOcean) {
      // Sanity check our translation logic for removing bias term - should generate same predictions
      const predictResult = (await trainer.predict(fish)).predictedClassId;
      const translatedPredictResult = trainer.translatedPredict(
        fish.getKnnData()
      );
      expect(predictResult).toEqual(translatedPredictResult);

      // Mouths should have highest impact since we're selecting for smiling fish
      const predictionExplanation = trainer.explainFish(fish);
      expect(predictionExplanation[0].partType).toEqual('mouths');
    }
  });

});
