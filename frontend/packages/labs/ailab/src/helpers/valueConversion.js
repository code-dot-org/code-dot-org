/*
  The machine learning algorithms we're using only process numerical data. We
  convert categorical strings into ordinal integers to pass to the algorithm and
  likewise convert the returned integers back into human-readable strings.
*/
import { isEmpty, getKeyByValue } from "./utils.js";
import { getSelectedCategoricalColumns } from "../selectors.js";

// Take a ML-friendly integer and convert to human-readable string.
export function convertValueForDisplay(state, value, column) {
  const convertedValue =
    getSelectedCategoricalColumns(state).includes(column) &&
    !isEmpty(state.featureNumberKey)
      ? getKeyByValue(state.featureNumberKey[column], value)
      : value;
  return convertedValue;
}

// Take a human-readable string and convert to a ML-friendly integer.
export function convertValueForTraining(state, value, column) {
  const convertedValue = getSelectedCategoricalColumns(state).includes(column)
    ? state.featureNumberKey[column][value]
    : parseFloat(value);
  return convertedValue;
}

export function getConvertedPredictedLabel(state) {
  return convertValueForDisplay(
    state,
    state.prediction,
    state.labelColumn
  );
}

export function getConvertedLabels(state, rawLabels = []) {
  return rawLabels.map(label =>
    convertValueForDisplay(state, label, state.labelColumn)
  );
}

export function getConvertedAccuracyCheckExamples(state) {
  const convertedAccuracyCheckExamples = [];
  var example;
  for (example of state.accuracyCheckExamples) {
    let convertedAccuracyCheckExample = [];
    for (var i = 0; i < state.selectedFeatures.length; i++) {
      convertedAccuracyCheckExample.push(
        convertValueForDisplay(
          state,
          example[i],
          state.selectedFeatures[i]
        )
      );
    }
    convertedAccuracyCheckExamples.push(convertedAccuracyCheckExample);
  }
  return convertedAccuracyCheckExamples;
}
