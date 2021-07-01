/*
  Functions for calculating the accuracy of trained machine learning models.
  "Grade" is "correct" or "incorrect". Categorical predicted and expected
  labels must match exactly to count as "correct". Numerical predicted and
  expected labels must be within 5% of the range of labels to count as
  "correct".
*/

import { ResultsGrades, REGRESSION_ERROR_TOLERANCE } from "../constants.js";
import { getExtrema } from "./columnDetails.js";
import {
  getConvertedLabels,
  getConvertedAccuracyCheckExamples
} from "./valueConversion.js";
import { isRegression } from "../redux.js"

export function getPercentCorrect(state) {
  const percentCorrect = isRegression(state)
    ? getAccuracyRegression(state).percentCorrect
    : getAccuracyClassification(state).percentCorrect;
  return percentCorrect;
}

export function getAccuracyClassification(state) {
  let accuracy = {};
  let numCorrect = 0;
  let grades = [];
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
  accuracy.percentCorrect = ((numCorrect / numPredictedLabels) * 100).toFixed(
    2
  );
  accuracy.grades = grades;
  return accuracy;
}

export function getAccuracyRegression(state) {
  let accuracy = {};
  let numCorrect = 0;
  let grades = [];
  const range = getExtrema(state.data, state.labelColumn).range;
  const errorTolerance = (range * REGRESSION_ERROR_TOLERANCE) / 100;
  const numPredictedLabels = state.accuracyCheckPredictedLabels.length;
  for (let i = 0; i < numPredictedLabels; i++) {
    const diff = Math.abs(
      state.accuracyCheckLabels[i] - state.accuracyCheckPredictedLabels[i]
    );
    if (diff <= errorTolerance) {
      numCorrect++;
      grades.push(ResultsGrades.CORRECT);
    } else {
      grades.push(ResultsGrades.INCORRECT);
    }
  }
  accuracy.percentCorrect = ((numCorrect / numPredictedLabels) * 100).toFixed(
    2
  );
  accuracy.grades = grades;
  return accuracy;
}

export function getAccuracyGrades(state) {
  const grades = isRegression(state)
    ? getAccuracyRegression(state).grades
    : getAccuracyClassification(state).grades;
  return grades;
}

export function getResultsByGrade(state, grade) {
  const results = {};
  const accuracyGrades = getAccuracyGrades(state);
  const examples = getConvertedAccuracyCheckExamples(state).filter((example, index) => {
    return grade === ResultsGrades.ALL || grade === accuracyGrades[index];
  });
  const labels = getConvertedLabels(state, state.accuracyCheckLabels).filter((example, index) => {
    return grade === ResultsGrades.ALL || grade === accuracyGrades[index];
  });
  const predictedLabels = getConvertedLabels(state, state.accuracyCheckPredictedLabels).filter((example, index) => {
    return grade === ResultsGrades.ALL || grade === accuracyGrades[index];
  });
  results.examples = examples;
  results.labels = labels;
  results.predictedLabels = predictedLabels;
  return results;
}
