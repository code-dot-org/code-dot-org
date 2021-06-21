import {
  getAccuracyRegression,
  getAccuracyClassification,
  getAccuracyGrades,
  getResultsByGrade
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

const classificationGrades = [
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

const mixedResults = [0, 0, 0, 1, 1, 0];

describe('redux functions', () => {
  test('getAccuracyClassification - all accurate', async () => {
    const accurateResults  = [1, 0, 0, 0, 0, 1];
    classificationState['accuracyCheckPredictedLabels'] = accurateResults;

    const accuracy = getAccuracyClassification(classificationState);
    expect(accuracy.grades).toEqual(allCorrectGrades);
    expect(accuracy.percentCorrect).toBe('100.00');
  });

  test('getAccuracyClassification - mostly accurate', async () => {
    const mostlyAccurateResults = [1, 0, 0, 0, 0, 0];
    classificationState['accuracyCheckPredictedLabels'] =
      mostlyAccurateResults;

    const accuracy = getAccuracyClassification(classificationState);
    expect(accuracy.grades).toEqual(mostlyCorrectGrades);
    expect(accuracy.percentCorrect).toBe('83.33');
  });

  test('getAccuracyClassification - not very accurate', async () => {
    classificationState['accuracyCheckPredictedLabels'] = mixedResults;
    const accuracy = getAccuracyClassification(classificationState);
    expect(accuracy.grades).toEqual(classificationGrades);
    expect(accuracy.percentCorrect).toBe('33.33');
  });

  test('getAccuracyClassification - 0% accuracy', async () => {
    const inaccurateResults = [0, 1, 1, 1, 1, 0];
    classificationState['accuracyCheckPredictedLabels'] =
      inaccurateResults;

    const accuracy = getAccuracyClassification(classificationState);
    expect(accuracy.grades).toEqual(allIncorrectGrades);
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
      mixedResults;
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
    classificationState['accuracyCheckPredictedLabels'] = mixedResults;
    const results = getResultsByGrade(classificationState, ResultsGrades.CORRECT);
    const resultsCount = results.examples.length;
    const expectedCount = classificationGrades.filter(
      grade => grade === ResultsGrades.CORRECT
    ).length;
    expect(resultsCount).toBe(expectedCount);
  });

  test("getResultsByGrade - incorrect, classification", async () => {
    classificationState['accuracyCheckPredictedLabels'] = mixedResults;
    const results = getResultsByGrade(classificationState, ResultsGrades.INCORRECT);
    const resultsCount = results.examples.length;
    const expectedCount = classificationGrades.filter(
      grade => grade === ResultsGrades.INCORRECT
    ).length;
    expect(resultsCount).toBe(expectedCount);
  });
});
