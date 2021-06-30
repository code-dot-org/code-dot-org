import {
  getAccuracyRegression,
  getAccuracyClassification,
  getAccuracyGrades,
  getResultsByGrade,
  getPercentCorrect
} from '../../src/helpers/accuracy.js';
import { classificationState, regressionState } from './testData';
import { ResultsGrades, ColumnTypes } from '../../src/constants.js';

const regressionGrades = [
  ResultsGrades.INCORRECT,
  ResultsGrades.CORRECT,
  ResultsGrades.CORRECT,
  ResultsGrades.CORRECT,
  ResultsGrades.CORRECT,
  ResultsGrades.INCORRECT
];

const mixedGrades = [
  ResultsGrades.INCORRECT,
  ResultsGrades.CORRECT,
  ResultsGrades.CORRECT,
  ResultsGrades.INCORRECT,
  ResultsGrades.INCORRECT,
  ResultsGrades.INCORRECT
];

const allCorrectGrades = [
  ResultsGrades.CORRECT,
  ResultsGrades.CORRECT,
  ResultsGrades.CORRECT,
  ResultsGrades.CORRECT,
  ResultsGrades.CORRECT,
  ResultsGrades.CORRECT
];

const allIncorrectGrades = [
  ResultsGrades.INCORRECT,
  ResultsGrades.INCORRECT,
  ResultsGrades.INCORRECT,
  ResultsGrades.INCORRECT,
  ResultsGrades.INCORRECT,
  ResultsGrades.INCORRECT
];

const mostlyCorrectGrades = [
  ResultsGrades.CORRECT,
  ResultsGrades.CORRECT,
  ResultsGrades.CORRECT,
  ResultsGrades.CORRECT,
  ResultsGrades.CORRECT,
  ResultsGrades.INCORRECT
];

const inaccuratePercent = "0.00";
const accuratePercent = "100.00";
const mostlyCorrectPercent = "83.33";
const lowAccuracyPercent = "33.33";
// error tolerance of +/- 0.15, 4/6 correct
const regressionPercent = "66.67";

const accurateResults  = [1, 0, 0, 0, 0, 1];
const mixedResults = [0, 0, 0, 1, 1, 0];
const mostlyAccurateResults = [1, 0, 0, 0, 0, 0];
const inaccurateResults = [0, 1, 1, 1, 1, 0];

const classificationTestCases = [
  {
    case: "classification - accurate",
    results: accurateResults,
    grades: allCorrectGrades,
    percent: accuratePercent
  },
  {
    case: "classification - inaccurate",
    results: inaccurateResults,
    grades: allIncorrectGrades,
    percent: inaccuratePercent
  },
  {
    case: "classification - mostly accurate",
    results: mostlyAccurateResults,
    grades: mostlyCorrectGrades,
    percent: mostlyCorrectPercent
  },
  {
    case: "classification - low accuracy",
    results: mixedResults,
    grades: mixedGrades,
    percent: lowAccuracyPercent
  }
]

describe('get accuracy', () => {
  classificationTestCases.forEach(testCase => {
    test(testCase.case, async () => {
      classificationState['accuracyCheckPredictedLabels'] = testCase.results;
      const accuracy = getAccuracyClassification(classificationState);
      expect(accuracy.grades).toEqual(testCase.grades);
      expect(accuracy.percentCorrect).toEqual(testCase.percent);
    })
  })

  test('regression', async () => {
    const accuracy = getAccuracyRegression(regressionState);
    expect(accuracy.grades).toEqual(regressionGrades);
    expect(accuracy.percentCorrect).toBe(regressionPercent);
  })
});

describe('get grades', () => {
  classificationTestCases.forEach(testCase => {
    test(testCase.case, async () => {
      classificationState['accuracyCheckPredictedLabels'] = testCase.results;
      const grades = getAccuracyGrades(classificationState);
      expect(grades).toEqual(testCase.grades);
    })
  })

  test('regression', async () => {
    const grades = getAccuracyGrades(regressionState);
    expect(grades).toEqual(regressionGrades);
  })
});

describe('get percent correct', () => {
  classificationTestCases.forEach(testCase => {
    test(testCase.case, async () => {
      classificationState['accuracyCheckPredictedLabels'] = testCase.results;
      const percentCorrect = getPercentCorrect(classificationState);
      expect(percentCorrect).toEqual(testCase.percent);
    })
  })

  test('regression', async () => {
    const percentCorrect = getPercentCorrect(regressionState);
    expect(percentCorrect).toEqual(regressionPercent);
  })
});

describe('get results', () => {
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
    classificationState['accuracyCheckPredictedLabels'] = mixedResults;
    const results = getResultsByGrade(classificationState, ResultsGrades.CORRECT);
    const resultsCount = results.examples.length;
    const expectedCount = mixedGrades.filter(
      grade => grade === ResultsGrades.CORRECT
    ).length;
    expect(resultsCount).toBe(expectedCount);
  });

  test("getResultsByGrade - incorrect, classification", async () => {
    classificationState['accuracyCheckPredictedLabels'] = mixedResults;
    const results = getResultsByGrade(classificationState, ResultsGrades.INCORRECT);
    const resultsCount = results.examples.length;
    const expectedCount = mixedGrades.filter(
      grade => grade === ResultsGrades.INCORRECT
    ).length;
    expect(resultsCount).toBe(expectedCount);
  });
});
