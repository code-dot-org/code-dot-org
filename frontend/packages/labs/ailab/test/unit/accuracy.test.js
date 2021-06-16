import {
  getAccuracyRegression,
  getAccuracyClassification,
  getAccuracyGrades,
  getResultsByGrade
} from '../../src/helpers/accuracy.js';
import { ResultsGrades, ColumnTypes } from '../../src/constants.js';

const columnsByDataType = {};
columnsByDataType['height'] = ColumnTypes.NUMERICAL;
columnsByDataType['sun'] = ColumnTypes.CATEGORICAL;

const regressionState = {
  data: [
    {
      sun: 'high',
      height: 3.8
    },
    {
      sun: 'high',
      height: 3.9
    },
    {
      sun: 'medium',
      height: 2.6
    },
    {
      sun: 'medium',
      height: 2.5
    },
    {
      sun: 'low',
      height: 0.9
    },
    {
      sun: 'low',
      height: 1.6
    }
  ],
  labelColumn: 'height',
  accuracyCheckPredictedLabels: [4.0, 3.75, 2.63, 2.46, 1.6, 1.0],
  accuracyCheckLabels: [5.9, 3.8, 2.6, 2.5, 1.6, 0.7],
  accuracyCheckExamples: [[2], [2], [1], [1], [0], [0]],
  selectedFeatures: ['sun'],
  columnsByDataType: columnsByDataType,
  featureNumberKey: {
    'sun': {
      'low' : 0,
      'medium' : 1,
      'high' : 2,
    }
  }
};

const regressionGrades = [
  ResultsGrades.INCORRECT,
  ResultsGrades.CORRECT,
  ResultsGrades.CORRECT,
  ResultsGrades.CORRECT,
  ResultsGrades.CORRECT,
  ResultsGrades.INCORRECT
];

const classificationState = {
  data: [
    {
      weather: 'sunny',
      temp: 'hot',
      play: 'no'
    },
    {
      weather: 'overcast',
      temp: 'hot',
      play: 'yes'
    },
    {
      weather: 'overcast',
      temp: 'mild',
      play: 'yes'
    },
    {
      weather: 'overcast',
      temp: 'cool',
      play: 'yes'
    },
    {
      weather: 'rainy',
      temp: 'mild',
      play: 'yes'
    },
    {
      weather: 'rainy',
      temp: 'cool',
      play: 'no'
    }
  ],
  labelColumn: 'play',
  selectedFeatures: ['temp', 'weather'],
  columnsByDataType: {
    weather: 'categorical',
    temp: 'categorical',
    play: 'categorical'
  },
  accuracyCheckLabels: [1, 0, 0, 0, 0, 1],
  accuracyCheckExamples: [[0,2], [1,2], [1,1], [1,0], [2,1], [2,0]],
  featureNumberKey: {
    'temp': {
      'cool' : 0,
      'mild' : 1,
      'hot' : 2,
    },
    'play': {
      'yes' : 0,
      'no' : 1
    },
    'weather': {
      'sunny' : 0,
      'overcast' : 1,
      'rainy': 2
    }
  }
};

const mixedClassificationResults = [0, 0, 0, 1, 1, 0];

const classificationGrades = [
  ResultsGrades.INCORRECT,
  ResultsGrades.CORRECT,
  ResultsGrades.CORRECT,
  ResultsGrades.INCORRECT,
  ResultsGrades.INCORRECT,
  ResultsGrades.INCORRECT
];

describe('redux functions', () => {
  test('getAccuracyClassification - all accurate', async () => {
    const accurateResults  = [1, 0, 0, 0, 0, 1];
    classificationState['accuracyCheckPredictedLabels'] =
      accurateResults;

    const accuracy = getAccuracyClassification(classificationState);
    expect(accuracy.grades).toEqual([
      ResultsGrades.CORRECT,
      ResultsGrades.CORRECT,
      ResultsGrades.CORRECT,
      ResultsGrades.CORRECT,
      ResultsGrades.CORRECT,
      ResultsGrades.CORRECT
    ]);
    expect(accuracy.percentCorrect).toBe('100.00');
  });

  test('getAccuracyClassification - mostly accurate', async () => {
    const mostlyAccurateResults = [1, 0, 0, 0, 0, 0];
    classificationState['accuracyCheckPredictedLabels'] =
      mostlyAccurateResults;

    const accuracy = getAccuracyClassification(classificationState);
    expect(accuracy.grades).toEqual([
      ResultsGrades.CORRECT,
      ResultsGrades.CORRECT,
      ResultsGrades.CORRECT,
      ResultsGrades.CORRECT,
      ResultsGrades.CORRECT,
      ResultsGrades.INCORRECT
    ]);
    expect(accuracy.percentCorrect).toBe('83.33');
  });

  test('getAccuracyClassification - not very accurate', async () => {
    const mixedResults = [0, 0, 0, 1, 1, 0];
    classificationState['accuracyCheckPredictedLabels'] =
      mixedClassificationResults;
    const accuracy = getAccuracyClassification(classificationState);
    expect(accuracy.grades).toEqual(classificationGrades);
    expect(accuracy.percentCorrect).toBe('33.33');
  });

  test('getAccuracyClassification - 0% accuracy', async () => {
    const inaccurateResults = [0, 1, 1, 1, 1, 0];
    classificationState['accuracyCheckPredictedLabels'] =
      inaccurateResults;

    const accuracy = getAccuracyClassification(classificationState);
    expect(accuracy.grades).toEqual([
      ResultsGrades.INCORRECT,
      ResultsGrades.INCORRECT,
      ResultsGrades.INCORRECT,
      ResultsGrades.INCORRECT,
      ResultsGrades.INCORRECT,
      ResultsGrades.INCORRECT
    ]);
    expect(accuracy.percentCorrect).toBe('0.00');
  });

  test("getAccuracyRegression", async () => {
    const accuracy = getAccuracyRegression(regressionState);
    expect(accuracy.grades).toEqual(regressionGrades);
    // error tolerance of +/- 0.15, 4/6 correct
    expect(accuracy.percentCorrect).toBe("66.67");
  });

  test("getAccuracyGrades - regression", async () => {
    const grades = getAccuracyGrades(regressionState);
    expect(grades).toEqual(regressionGrades);
  })

  test("getAccuracyGrades - classification", async () => {
    classificationState['accuracyCheckPredictedLabels'] =
      mixedClassificationResults;
    const grades = getAccuracyGrades(classificationState);
    expect(grades).toEqual(classificationGrades);
  })

  test("getResultsByGrade - correct, regression", async () => {
    const results = getResultsByGrade(regressionState, ResultsGrades.CORRECT);
    const resultsCount = results.examples.length;
    const expectedCount = regressionGrades.filter(
      grade => grade === ResultsGrades.CORRECT
    ).length;
    expect(resultsCount).toBe(expectedCount);
  });

  test("getResultsByGrade - incorrect, regression", async () => {
    const results = getResultsByGrade(regressionState, ResultsGrades.INCORRECT);
    const resultsCount = results.examples.length;
    const expectedCount = regressionGrades.filter(
      grade => grade === ResultsGrades.INCORRECT
    ).length;
    expect(resultsCount).toBe(expectedCount);
  });

  test("getResultsByGrade - correct, classification", async () => {
    classificationState['accuracyCheckPredictedLabels'] =
      mixedClassificationResults;
    const results = getResultsByGrade(classificationState, ResultsGrades.CORRECT);
    const resultsCount = results.examples.length;
    const expectedCount = classificationGrades.filter(
      grade => grade === ResultsGrades.CORRECT
    ).length;
    expect(resultsCount).toBe(expectedCount);
  });

  test("getResultsByGrade - incorrect, classification", async () => {
    classificationState['accuracyCheckPredictedLabels'] =
      mixedClassificationResults;
    const results = getResultsByGrade(classificationState, ResultsGrades.INCORRECT);
    const resultsCount = results.examples.length;
    const expectedCount = classificationGrades.filter(
      grade => grade === ResultsGrades.INCORRECT
    ).length;
    expect(resultsCount).toBe(expectedCount);
  });
});
