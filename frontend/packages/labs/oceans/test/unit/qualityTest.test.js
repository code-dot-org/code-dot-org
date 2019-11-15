const {
  initFishData,
  fishData,
  MouthExpression,
  BodyShape
} = require('../../src/utils/fishData');
const {generateOcean, filterOcean} = require('../../src/utils/generateOcean');
const SimpleTrainer = require('../../src/utils/SimpleTrainer');
const SVMTrainer = require('../../src/utils/SVMTrainer');

const trial = async function(trainSize, testSize, trainer, labelFn) {
  const trainingOcean = generateOcean(trainSize);
  const trainingLabels = trainingOcean.map(fish => labelFn(fish));

  const testOcean = generateOcean(testSize);

  for (const fish of trainingOcean) {
    const label = labelFn(fish);
    trainer.addTrainingExample(fish, label);
  }

  trainer.train();

  for (const fish of testOcean) {
    fish.result = await trainer.predict(fish);
  }

  //console.log(testOcean[0].dataFields);
  //console.log(trainer.svm.toJSON());
  //console.log(JSON.stringify(trainer.svm.w));

  const fieldsAndValues = [];
  for (var i = 0; i < trainer.svm.w.length; i++) {
    fieldsAndValues.push([testOcean[0].dataFields[i], Math.abs(trainer.svm.w[i])]);
  }
  fieldsAndValues.sort((a, b) => b[1] - a[1]);

  console.log(JSON.stringify(fieldsAndValues, null, 2));

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

const NUM_TRIALS = 5;
const TRAIN_SIZE = 100;

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
  //     const labelFn = (fish) => ids.includes(fish.colorPalette.index) ? 1 : 0;
  //     const result = await performTrials({
  //       numTrials: NUM_TRIALS,
  //       trainSize: trainSize,
  //       testSize: 100,
  //       labelFn: labelFn
  //     });
  //     analyzeConfusionMatrix(trainSize, result);
  //     expect(result.precision).toBeGreaterThanOrEqual(0.9);
  //     expect(result.recall).toBeGreaterThanOrEqual(0.6);
  //   }
  // });
/*
  test('Body shape test', async () => {
    const partKey = PartKey.BODY;
    const knnDataIndex = 1;
    const attribute = BodyShape;
    const trainSize = TRAIN_SIZE;

    for (const [shape, id] of Object.entries(attribute)) {
      console.log(`${shape}`);
      const normalizedId = (1.0 * id) / (Object.keys(attribute).length - 1);
      const labelFn = fish =>
        floatEquals(fish[partKey].knnData[knnDataIndex], normalizedId) ? 1 : 0;

      const result = await performTrials({
        numTrials: NUM_TRIALS,
        trainSize: trainSize,
        testSize: 100,
        labelFn: labelFn
      });
      analyzeConfusionMatrix(trainSize, result);
      expect(result.precision).toBeGreaterThanOrEqual(0.9);
      expect(result.recall).toBeGreaterThanOrEqual(0.6);
    }
  });
*/
  test('test eyes', async () => {
    const partData = fishData.eyes;
    const partKey = PartKey.EYE;
    const trainSize = TRAIN_SIZE;

    //console.log(JSON.stringify(partData));

    for (const [name, data] of Object.entries(partData)) {
      console.log(`${partKey} ${name}`);
      const id = data.index;
      const labelFn = fish => (fish[partKey].index === id ? 1 : 0);
      const result = await performTrials({
        numTrials: 1,
        trainSize: trainSize,
        testSize: 100,
        labelFn: labelFn
      });
      analyzeConfusionMatrix(trainSize, result);
    }
  });
/*
  test('test mouths', async () => {
    const partData = fishData.mouths;
    const partKey = PartKey.MOUTH;
    const trainSize = TRAIN_SIZE;

    for (const [name, data] of Object.entries(partData)) {
      console.log(`${partKey} ${name}`);
      const id = data.index;
      const labelFn = fish => (fish[partKey].index === id ? 1 : 0);
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
      console.log(`${partKey} ${name}`);
      const id = data.index;
      const labelFn = fish => {
        //console.log(JSON.stringify(fish, null, 2));
        return fish[partKey].index === id ? 1 : 0;
      };
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

    for (const [expressionName, expressionId] of Object.entries(
      MouthExpression
    )) {
      console.log(`${partKey} ${expressionName}`);
      const normalizedId =
        (1.0 * expressionId) / (Object.keys(MouthExpression).length - 1);
      const labelFn = fish =>
        floatEquals(fish[partKey].knnData[knnDataIndex], normalizedId) ? 1 : 0;
      const result = await performTrials({
        numTrials: NUM_TRIALS,
        trainSize: trainSize,
        testSize: 100,
        labelFn: labelFn
      });
      analyzeConfusionMatrix(trainSize, result);
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

    const labelFn = fish => (ids.includes(fish[partKey].index) ? 1 : 0);
    const result = await performTrials({
      numTrials: NUM_TRIALS,
      trainSize: trainSize,
      testSize: 100,
      labelFn: labelFn
    });
    analyzeConfusionMatrix(trainSize, result);
  });
*/
});
