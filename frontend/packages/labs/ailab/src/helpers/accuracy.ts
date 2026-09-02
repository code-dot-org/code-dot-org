/*
  Functions for calculating the accuracy of trained machine learning models
  based on the results returned from testing the model. "Grade" is "correct" or
  "incorrect". Categorical predicted and expected labels must match exactly to
  count as "correct". Numerical predicted and expected labels must be within 5%
  of the range of labels to count as "correct".
*/

import {ResultsGrades, REGRESSION_ERROR_TOLERANCE, MLTypes} from '../constants';
import type {RootState} from '../redux';
import type {ResultsData, DataRow} from '../types';

import {getExtrema, isRegression} from './columnDetails';
import {
  getConvertedLabels,
  getConvertedAccuracyCheckExamples,
} from './valueConversion';

// Return results data so that it looks like regular data provided to the
// DataTable.
export function getResultsDataInDataTableForm(state: RootState): DataRow[] {
  const resultsByGrades = getAllResults(state);

  if (!resultsByGrades || resultsByGrades.examples.length === 0) {
    return [];
  }

  // None of the existing uses of this function should need more than 10
  // items.  Increase the value here if they do.
  const numItems = Math.min(10, resultsByGrades.examples.length);

  const results: DataRow[] = [];
  for (let i = 0; i < numItems; i++) {
    results[i] = {};

    state.selectedFeatures.map((feature: string, index: number) => {
      results[i][feature] = resultsByGrades.examples[i][index];
    });

    results[i][state.labelColumn!] = resultsByGrades.predictedLabels[i];
  }

  return results;
}

export function getAllResults(state: RootState): ResultsData {
  return getResultsByGrade(state, ResultsGrades.ALL);
}

export function getCorrectResults(state: RootState): ResultsData {
  return getResultsByGrade(state, ResultsGrades.CORRECT);
}

export function getIncorrectResults(state: RootState): ResultsData {
  return getResultsByGrade(state, ResultsGrades.INCORRECT);
}

export function getResultsByGrade(
  state: RootState,
  grade: string,
): ResultsData {
  const accuracyGrades = getAccuracyGrades(state);
  const examples = getConvertedAccuracyCheckExamples(state).filter(
    (_example: (string | number)[], index: number) => {
      return grade === ResultsGrades.ALL || grade === accuracyGrades[index];
    },
  );
  const labels = getConvertedLabels(state, state.accuracyCheckLabels).filter(
    (_label: string | number, index: number) => {
      return grade === ResultsGrades.ALL || grade === accuracyGrades[index];
    },
  );
  const predictedLabels = getConvertedLabels(
    state,
    state.accuracyCheckPredictedLabels,
  ).filter((_label: string | number, index: number) => {
    return grade === ResultsGrades.ALL || grade === accuracyGrades[index];
  });
  return {examples, labels, predictedLabels};
}

export function getAccuracyGrades(state: RootState): string[] {
  const grades = isRegression(state)
    ? getAccuracyRegression(state).grades
    : getAccuracyClassification(state).grades;
  return grades;
}

export function getSummaryStat(state: RootState): {type: string; stat: string} {
  return {
    type: isRegression(state) ? MLTypes.REGRESSION : MLTypes.CLASSIFICATION,
    stat: getPercentCorrect(state),
  };
}

export function getPercentCorrect(state: RootState): string {
  const percentCorrect = isRegression(state)
    ? getAccuracyRegression(state).percentCorrect
    : getAccuracyClassification(state).percentCorrect;
  return percentCorrect;
}

export interface AccuracyGradeOptions {
  // Absent means an exact match. Present means within this difference.
  tolerance?: number;
}

export interface AccuracyGrades {
  percentCorrect: string;
  grades: string[];
}

export function gradeAccuracy(
  predictedLabels: (number | string)[] | undefined,
  expectedLabels: (number | string)[],
  options: AccuracyGradeOptions = {},
): AccuracyGrades {
  const {tolerance} = options;
  const grades: string[] = [];
  let numCorrect = 0;
  const count = predictedLabels ? predictedLabels.length : 0;

  for (let i = 0; i < count; i++) {
    const predicted = predictedLabels![i];
    const expected = expectedLabels[i];
    const correct =
      tolerance === undefined
        ? expected.toString() === predicted.toString()
        : Math.abs(Number(expected) - Number(predicted)) <= tolerance;

    if (correct) {
      numCorrect++;
      grades.push(ResultsGrades.CORRECT);
    } else {
      grades.push(ResultsGrades.INCORRECT);
    }
  }

  return {
    // An empty list gives "NaN", which is what the lab has always reported.
    percentCorrect: ((numCorrect / count) * 100).toFixed(2),
    grades,
  };
}

function regressionTolerance(state: RootState): number {
  const {range} = getExtrema(state.data, state.labelColumn!);
  return (range * REGRESSION_ERROR_TOLERANCE) / 100;
}

/* The grading rule for the label column this level uses. */
export function getGradeOptions(state: RootState): AccuracyGradeOptions {
  return isRegression(state) ? {tolerance: regressionTolerance(state)} : {};
}

export function getAccuracyClassification(state: RootState): AccuracyGrades {
  return gradeAccuracy(
    state.accuracyCheckPredictedLabels,
    state.accuracyCheckLabels,
  );
}

export function getAccuracyRegression(state: RootState): AccuracyGrades {
  return gradeAccuracy(
    state.accuracyCheckPredictedLabels,
    state.accuracyCheckLabels,
    {tolerance: regressionTolerance(state)},
  );
}
