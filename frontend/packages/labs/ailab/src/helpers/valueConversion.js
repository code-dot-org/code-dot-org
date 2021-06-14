/*
  The machine learning algorithms we're using only process numerical data. We
  convert categorical strings into ordinal integers to pass to the algorithm and
  likewise convert the returned integers back into human-readable strings.
*/
import { isEmpty, getKeyByValue } from "./utils.js";
import { getSelectedCategoricalColumns } from "../redux.js";

// Take a ML-friendly integer and convert to human-readable string.
export function getConvertedValueForDisplay(state, rawValue, column) {
  const convertedValue =
    getSelectedCategoricalColumns(state).includes(column) &&
    !isEmpty(state.featureNumberKey)
      ? getKeyByValue(state.featureNumberKey[column], rawValue)
      : rawValue;
  return convertedValue;
}

/* For feature columns that store categorical data, looks up the value
  associated with a row's specific option for a given feature; otherwise
  returns the option converted to an integer for feature columns that store
  numerical data.
  @param {object} row, entry from the dataset
  {
    labelColumn: option,
    featureColumn1: option,
    featureColumn2: option
    ...
  }
  @param {string} - feature name
  @return {integer}
  */
export function convertValueForTraining(state, feature, row) {
  return getSelectedCategoricalColumns(state).includes(feature)
    ? state.featureNumberKey[feature][row[feature]]
    : parseFloat(row[feature]);
}
