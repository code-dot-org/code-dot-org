/*
  Functions for calculating the accuracy of trained machine learning models
  based on the results returned from testing the model. "Grade" is "correct" or
  "incorrect". Categorical predicted and expected labels must match exactly to
  count as "correct". Numerical predicted and expected labels must be within 5%
  of the range of labels to count as "correct".
*/

import {ResultsGrades, REGRESSION_ERROR_TOLERANCE, MLTypes} from '../constants';
import {getExtrema} from './columnDetails';
import {
  getConvertedLabels,
  getConvertedAccuracyCheckExamples,
} from './valueConversion';
import {isRegression, RootState} from '../redux';
import {ResultsData, DataRow} from '../types';

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

export function getAccuracyClassification(state: RootState): {
  percentCorrect: string;
  grades: string[];
} {
  let numCorrect = 0;
  const grades = [];
  const numPredictedLabels = state.accuracyCheckPredictedLabels
    ? state.accuracyCheckPredictedLabels.length
    : 0;
  for (let i = 0; i < numPredictedLabels; i++) {
    if (
      state.accuracyCheckLabels[i].toString() ===
      state.accuracyCheckPredictedLabels[i].toString()
    ) {
      numCorrect++;
      grades.push(ResultsGrades.CORRECT);
    } else {
      grades.push(ResultsGrades.INCORRECT);
    }
  }
  return {
    percentCorrect: ((numCorrect / numPredictedLabels) * 100).toFixed(2),
    grades,
  };
}

export function getAccuracyRegression(state: RootState): {
  percentCorrect: string;
  grades: string[];
} {
  let numCorrect = 0;
  const grades: string[] = [];
  const range = getExtrema(state.data, state.labelColumn!).range;
  const errorTolerance = (range * REGRESSION_ERROR_TOLERANCE) / 100;
  const numPredictedLabels = state.accuracyCheckPredictedLabels.length;
  for (let i = 0; i < numPredictedLabels; i++) {
    const diff = Math.abs(
      Number(state.accuracyCheckLabels[i]) -
        Number(state.accuracyCheckPredictedLabels[i]),
    );
    if (diff <= errorTolerance) {
      numCorrect++;
      grades.push(ResultsGrades.CORRECT);
    } else {
      grades.push(ResultsGrades.INCORRECT);
    }
  }
  return {
    percentCorrect: ((numCorrect / numPredictedLabels) * 100).toFixed(2),
    grades,
  };
}
