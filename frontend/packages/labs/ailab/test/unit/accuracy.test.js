import {ResultsGrades, MLTypes} from '../../src/constants';
import {
  getAccuracyRegression,
  getAccuracyClassification,
  gradeAccuracy,
  getGradeOptions,
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

describe('gradeAccuracy', () => {
  test('with no tolerance, a label must match exactly', () => {
    const result = gradeAccuracy(['red', 'blue', 'red'], ['red', 'red', 'red']);

    expect(result.grades).toEqual([
      ResultsGrades.CORRECT,
      ResultsGrades.INCORRECT,
      ResultsGrades.CORRECT,
    ]);
    expect(result.percentCorrect).toBe('66.67');
  });

  test('a number and its string form match', () => {
    // Both sides go through toString, as they did before this function existed.
    expect(gradeAccuracy([1, '0'], ['1', 0]).percentCorrect).toBe('100.00');
  });

  test('with a tolerance, a label may differ by that much', () => {
    const result = gradeAccuracy([10, 10], [10.1, 12], {tolerance: 0.5});

    expect(result.grades).toEqual([
      ResultsGrades.CORRECT,
      ResultsGrades.INCORRECT,
    ]);
    expect(result.percentCorrect).toBe('50.00');
  });

  test('a difference exactly at the tolerance is correct', () => {
    expect(gradeAccuracy([10], [10.5], {tolerance: 0.5}).percentCorrect).toBe(
      '100.00',
    );
  });

  test('an empty prediction list reports NaN', () => {
    // The KNN sweep depends on this string losing the accuracy comparison.
    expect(gradeAccuracy([], [])).toEqual({percentCorrect: 'NaN', grades: []});
  });

  test('a missing prediction list reports NaN', () => {
    expect(gradeAccuracy(undefined, []).percentCorrect).toBe('NaN');
  });
});

describe('getGradeOptions', () => {
  test('a categorical label grades on an exact match', () => {
    expect(getGradeOptions(classificationState)).toEqual({});
  });

  test('a numerical label grades on 5% of the label range', () => {
    // The fixture heights run 0.9 to 3.9, so the range is 3 and 5% of it is 0.15.
    const {tolerance} = getGradeOptions(regressionState);
    expect(tolerance).toBeCloseTo(0.15, 10);
  });

  test('the regression selector uses that same tolerance', () => {
    const viaSelector = getAccuracyRegression(regressionState);
    const viaGrade = gradeAccuracy(
      regressionState.accuracyCheckPredictedLabels,
      regressionState.accuracyCheckLabels,
      getGradeOptions(regressionState),
    );

    expect(viaSelector).toEqual(viaGrade);
  });

  test('the classification selector uses that same rule', () => {
    expect(getAccuracyClassification(classificationState)).toEqual(
      gradeAccuracy(
        classificationState.accuracyCheckPredictedLabels,
        classificationState.accuracyCheckLabels,
        getGradeOptions(classificationState),
      ),
    );
  });
});
