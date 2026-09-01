import {ResultsGrades, MLTypes} from '../../src/constants';
import {
  gradeAccuracy,
  getAccuracyRegression,
  getAccuracyClassification,
  getAccuracyGrades,
  getResultsByGrade,
  getPercentCorrect,
  getResultsDataInDataTableForm,
  getSummaryStat,
} from '../../src/helpers/accuracy';

import {classificationState, regressionState} from './testData';

const regressionGrades = [
  ResultsGrades.INCORRECT,
  ResultsGrades.CORRECT,
  ResultsGrades.CORRECT,
  ResultsGrades.CORRECT,
  ResultsGrades.CORRECT,
  ResultsGrades.INCORRECT,
];

const mixedGrades = [
  ResultsGrades.INCORRECT,
  ResultsGrades.CORRECT,
  ResultsGrades.CORRECT,
  ResultsGrades.INCORRECT,
  ResultsGrades.INCORRECT,
  ResultsGrades.INCORRECT,
];

const allCorrectGrades = [
  ResultsGrades.CORRECT,
  ResultsGrades.CORRECT,
  ResultsGrades.CORRECT,
  ResultsGrades.CORRECT,
  ResultsGrades.CORRECT,
  ResultsGrades.CORRECT,
];

const allIncorrectGrades = [
  ResultsGrades.INCORRECT,
  ResultsGrades.INCORRECT,
  ResultsGrades.INCORRECT,
  ResultsGrades.INCORRECT,
  ResultsGrades.INCORRECT,
  ResultsGrades.INCORRECT,
];

const mostlyCorrectGrades = [
  ResultsGrades.CORRECT,
  ResultsGrades.CORRECT,
  ResultsGrades.CORRECT,
  ResultsGrades.CORRECT,
  ResultsGrades.CORRECT,
  ResultsGrades.INCORRECT,
];

const inaccuratePercent = '0.00';
const accuratePercent = '100.00';
const mostlyCorrectPercent = '83.33';
const lowAccuracyPercent = '33.33';
// error tolerance of +/- 0.15, 4/6 correct
const regressionPercent = '66.67';

const accurateResults = [1, 0, 0, 0, 0, 1];
const mixedResults = [0, 0, 0, 1, 1, 0];
const mostlyAccurateResults = [1, 0, 0, 0, 0, 0];
const inaccurateResults = [0, 1, 1, 1, 1, 0];

const classificationTestCases = [
  {
    case: 'classification - accurate',
    results: accurateResults,
    grades: allCorrectGrades,
    percent: accuratePercent,
  },
  {
    case: 'classification - inaccurate',
    results: inaccurateResults,
    grades: allIncorrectGrades,
    percent: inaccuratePercent,
  },
  {
    case: 'classification - mostly accurate',
    results: mostlyAccurateResults,
    grades: mostlyCorrectGrades,
    percent: mostlyCorrectPercent,
  },
  {
    case: 'classification - low accuracy',
    results: mixedResults,
    grades: mixedGrades,
    percent: lowAccuracyPercent,
  },
];

const gradesTestCases = [
  {
    case: 'getResultsByGrade - correct, regression',
    state: regressionState,
    grades: regressionGrades,
    gradeType: ResultsGrades.CORRECT,
  },
  {
    case: 'getResultsByGrade - incorrect, regression',
    state: regressionState,
    grades: regressionGrades,
    gradeType: ResultsGrades.INCORRECT,
  },
  {
    case: 'getResultsByGrade - correct, classification',
    state: classificationState,
    grades: mixedGrades,
    gradeType: ResultsGrades.CORRECT,
  },
  {
    case: 'getResultsByGrade - incorrect, classification',
    state: classificationState,
    grades: mixedGrades,
    gradeType: ResultsGrades.INCORRECT,
  },
];

const regressionDataForTable = [
  {sun: 'high', height: 4},
  {sun: 'high', height: 3.75},
  {sun: 'medium', height: 2.63},
  {sun: 'medium', height: 2.46},
  {sun: 'low', height: 1.6},
  {sun: 'low', height: 1},
];

const classificationDataForTable = [
  {temp: 'cool', weather: 'rainy', play: 'yes'},
  {temp: 'mild', weather: 'rainy', play: 'yes'},
  {temp: 'mild', weather: 'overcast', play: 'yes'},
  {temp: 'mild', weather: 'sunny', play: 'no'},
  {temp: 'hot', weather: 'overcast', play: 'no'},
  {temp: 'hot', weather: 'sunny', play: 'yes'},
];

const classificationOptions = {isRegression: false, labelRange: 0};

describe('grade accuracy', () => {
  test('a categorical label must match exactly', () => {
    const {percentCorrect, grades} = gradeAccuracy(
      [0, 1, 2, 0],
      [0, 1, 1, 2],
      classificationOptions,
    );

    expect(grades).toEqual([
      ResultsGrades.CORRECT,
      ResultsGrades.CORRECT,
      ResultsGrades.INCORRECT,
      ResultsGrades.INCORRECT,
    ]);
    expect(percentCorrect).toBe(50);
  });

  test('a categorical label compares as a string', () => {
    const {percentCorrect} = gradeAccuracy(
      ['1', 2],
      [1, '2'],
      classificationOptions,
    );

    expect(percentCorrect).toBe(100);
  });

  // A range of 100 gives a tolerance of 5.
  test('a numerical label is correct within 5% of the label range', () => {
    const {percentCorrect, grades} = gradeAccuracy(
      [50, 54, 55, 56],
      [50, 50, 50, 50],
      {isRegression: true, labelRange: 100},
    );

    expect(grades).toEqual([
      ResultsGrades.CORRECT,
      ResultsGrades.CORRECT,
      ResultsGrades.CORRECT,
      ResultsGrades.INCORRECT,
    ]);
    expect(percentCorrect).toBe(75);
  });

  test('an empty prediction list has no grades and no percentage', () => {
    const {percentCorrect, grades} = gradeAccuracy(
      [],
      [1, 2],
      classificationOptions,
    );

    expect(grades).toEqual([]);
    expect(percentCorrect).toBeNaN();
  });

  test('grading is independent of the call order', () => {
    const expected = [0, 1, 0, 1];
    const first = gradeAccuracy(expected, expected, classificationOptions);
    const second = gradeAccuracy([1, 1, 1, 1], expected, classificationOptions);

    expect(first.percentCorrect).toBe(100);
    expect(second.percentCorrect).toBe(50);
    expect(
      gradeAccuracy(expected, expected, classificationOptions).percentCorrect,
    ).toBe(100);
  });
});

describe('get accuracy', () => {
  classificationTestCases.forEach(testCase => {
    test(testCase.case, async () => {
      classificationState['accuracyCheckPredictedLabels'] = testCase.results;
      const accuracy = getAccuracyClassification(classificationState);
      expect(accuracy.grades).toEqual(testCase.grades);
      expect(accuracy.percentCorrect).toEqual(testCase.percent);
    });
  });

  test('regression', async () => {
    const accuracy = getAccuracyRegression(regressionState);
    expect(accuracy.grades).toEqual(regressionGrades);
    expect(accuracy.percentCorrect).toBe(regressionPercent);
  });
});

describe('get grades', () => {
  classificationTestCases.forEach(testCase => {
    test(testCase.case, async () => {
      classificationState['accuracyCheckPredictedLabels'] = testCase.results;
      const grades = getAccuracyGrades(classificationState);
      expect(grades).toEqual(testCase.grades);
    });
  });

  test('regression', async () => {
    const grades = getAccuracyGrades(regressionState);
    expect(grades).toEqual(regressionGrades);
  });
});

describe('get percent correct', () => {
  classificationTestCases.forEach(testCase => {
    test(testCase.case, async () => {
      classificationState['accuracyCheckPredictedLabels'] = testCase.results;
      const percentCorrect = getPercentCorrect(classificationState);
      expect(percentCorrect).toEqual(testCase.percent);
    });
  });

  test('regression', async () => {
    const percentCorrect = getPercentCorrect(regressionState);
    expect(percentCorrect).toEqual(regressionPercent);
  });
});

describe('get results', () => {
  gradesTestCases.forEach(testCase => {
    test(testCase.case, async () => {
      const results = getResultsByGrade(testCase.state, testCase.gradeType);
      const resultsCount = results.examples.length;
      const expectedCount = testCase.grades.filter(
        grade => grade === testCase.gradeType,
      ).length;
      expect(resultsCount).toBe(expectedCount);
    });
  });

  test('regression - all', async () => {
    const results = getResultsByGrade(regressionState, ResultsGrades.ALL);
    const resultsCount = results.examples.length;
    const expectedCount = regressionGrades.length;
    expect(resultsCount).toEqual(expectedCount);
  });

  test('classification - all', async () => {
    const results = getResultsByGrade(classificationState, ResultsGrades.ALL);
    const resultsCount = results.examples.length;
    const expectedCount = mixedGrades.length;
    expect(resultsCount).toEqual(expectedCount);
  });
});

describe('get results data in data table form', () => {
  test('regression', async () => {
    const resultsData = getResultsDataInDataTableForm(regressionState);
    expect(resultsData).toEqual(regressionDataForTable);
  });

  test('classification', async () => {
    const resultsData = getResultsDataInDataTableForm(classificationState);
    expect(resultsData).toEqual(classificationDataForTable);
  });
});

describe('get summary stat', () => {
  test('classification', async () => {
    const summaryStat = getSummaryStat(classificationState);
    expect(summaryStat.stat).toBe(lowAccuracyPercent);
    expect(summaryStat.type).toBe(MLTypes.CLASSIFICATION);
  });

  test('regression', async () => {
    const summaryStat = getSummaryStat(regressionState);
    expect(summaryStat.stat).toBe(regressionPercent);
    expect(summaryStat.type).toBe(MLTypes.REGRESSION);
  });
});
