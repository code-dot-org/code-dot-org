/*
  Functions for calculating the accuracy of trained machine learning models
  based on the results returned from testing the model. "Grade" is "correct" or
  "incorrect". Categorical predicted and expected labels must match exactly to
  count as "correct". Numerical predicted and expected labels must be within 5%
  of the range of labels to count as "correct".
*/

import {createSelector} from 'reselect';

import {ResultsGrades, REGRESSION_ERROR_TOLERANCE, MLTypes} from '../constants';
import type {RootState} from '../redux';
import type {AilabProject, ResultsData, DataRow} from '../types';

import {getExtrema, isRegression} from './columnDetails';
import {
  getConvertedLabels,
  getConvertedAccuracyCheckExamples,
} from './valueConversion';

// Return results data so that it looks like regular data provided to the
// DataTable.
export function getResultsDataInDataTableForm(
  state: RootState,
  project: AilabProject
): DataRow[] {
  const resultsByGrades = getAllResults(state, project);

  if (!resultsByGrades || resultsByGrades.examples.length === 0) {
    return [];
  }

  // None of the existing uses of this function should need more than 10
  // items.  Increase the value here if they do.
  const numItems = Math.min(10, resultsByGrades.examples.length);

  const results: DataRow[] = [];
  for (let i = 0; i < numItems; i++) {
    results[i] = {};

    project.selectedFeatures.map((feature: string, index: number) => {
      results[i][feature] = resultsByGrades.examples[i][index];
    });

    results[i][project.labelColumn!] = resultsByGrades.predictedLabels[i];
  }

  return results;
}

export function getAllResults(
  state: RootState,
  project: AilabProject
): ResultsData {
  return getResultsByGrade(state, project, ResultsGrades.ALL);
}

export function getResultsByGrade(
  state: RootState,
  project: AilabProject,
  grade: string
): ResultsData {
  const accuracyGrades = getAccuracyGrades(state, project);
  const examples = getConvertedAccuracyCheckExamples(state, project).filter(
    (_example: (string | number)[], index: number) => {
      return grade === ResultsGrades.ALL || grade === accuracyGrades[index];
    }
  );
  const labels = getConvertedLabels(
    state,
    project,
    state.accuracyCheckLabels
  ).filter((_label: string | number, index: number) => {
    return grade === ResultsGrades.ALL || grade === accuracyGrades[index];
  });
  const predictedLabels = getConvertedLabels(
    state,
    project,
    state.accuracyCheckPredictedLabels
  ).filter((_label: string | number, index: number) => {
    return grade === ResultsGrades.ALL || grade === accuracyGrades[index];
  });
  return {examples, labels, predictedLabels};
}

export function getCorrectCount(
  state: RootState,
  project: AilabProject
): {correct: number; total: number} {
  const grades = getAccuracyGrades(state, project);
  return {
    correct: grades.filter(grade => grade === ResultsGrades.CORRECT).length,
    total: grades.length,
  };
}

export function getSummaryStat(
  state: RootState,
  project: AilabProject
): {type: string; stat: string} {
  return {
    type: isRegression(state, project)
      ? MLTypes.REGRESSION
      : MLTypes.CLASSIFICATION,
    stat: getPercentCorrect(state, project),
  };
}

export function getPercentCorrect(
  state: RootState,
  project: AilabProject
): string {
  const percentCorrect = isRegression(state, project)
    ? getAccuracyRegression(state, project).percentCorrect
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
  options: AccuracyGradeOptions = {}
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

function regressionTolerance(data: DataRow[], labelColumn: string): number {
  const {range} = getExtrema(data, labelColumn);
  return (range * REGRESSION_ERROR_TOLERANCE) / 100;
}

export const getGradeOptions = createSelector(
  [
    isRegression,
    (state: RootState) => state.data,
    (_state: RootState, project: AilabProject) => project.labelColumn,
  ],
  (regression, data, labelColumn): AccuracyGradeOptions =>
    regression ? {tolerance: regressionTolerance(data, labelColumn!)} : {}
);

export const getAccuracyGrades = createSelector(
  [
    (state: RootState) => state.accuracyCheckPredictedLabels,
    (state: RootState) => state.accuracyCheckLabels,
    getGradeOptions,
  ],
  (predictedLabels, labels, gradeOptions): string[] =>
    gradeAccuracy(predictedLabels, labels, gradeOptions).grades
);

export function getAccuracyClassification(state: RootState): AccuracyGrades {
  return gradeAccuracy(
    state.accuracyCheckPredictedLabels,
    state.accuracyCheckLabels
  );
}

export function getAccuracyRegression(
  state: RootState,
  project: AilabProject
): AccuracyGrades {
  return gradeAccuracy(
    state.accuracyCheckPredictedLabels,
    state.accuracyCheckLabels,
    {tolerance: regressionTolerance(state.data, project.labelColumn!)}
  );
}

export function formatAccuracy(accuracy: string): string {
  const percent = Number(accuracy);
  return Number.isFinite(percent) ? `${percent}%` : '—';
}
