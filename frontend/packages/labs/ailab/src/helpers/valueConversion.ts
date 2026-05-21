/*
  The machine learning algorithms we're using only process numerical data. We
  convert categorical strings into ordinal integers to pass to the algorithm and
  likewise convert the returned integers back into human-readable strings.
*/
import {isEmpty, getKeyByValue} from './utils';
import {getSelectedCategoricalColumns} from '../selectors';
import {RootState} from '../redux';

// Take a ML-friendly integer and convert to human-readable string.
export function convertValueForDisplay(
  state: RootState,
  value: string | number,
  column: string,
): string | number {
  const convertedValue =
    getSelectedCategoricalColumns(state).includes(column) &&
    !isEmpty(state.featureNumberKey)
      ? getKeyByValue(state.featureNumberKey[column], value as number)
      : value;
  return convertedValue ?? value;
}

// Take a human-readable string and convert to a ML-friendly integer.
export function convertValueForTraining(
  state: RootState,
  value: string | number,
  column: string,
): number {
  const convertedValue = getSelectedCategoricalColumns(state).includes(column)
    ? state.featureNumberKey[column][String(value)]
    : parseFloat(String(value));
  return convertedValue;
}

export function getConvertedPredictedLabel(state: RootState): string | number {
  return convertValueForDisplay(
    state,
    state.prediction as string | number,
    state.labelColumn!,
  );
}

export function getConvertedLabels(
  state: RootState,
  rawLabels: (number | string)[] = [],
): (string | number)[] {
  return rawLabels.map(label =>
    convertValueForDisplay(state, label, state.labelColumn!),
  );
}

export function getConvertedAccuracyCheckExamples(
  state: RootState,
): (string | number)[][] {
  const convertedAccuracyCheckExamples: (string | number)[][] = [];
  let example: number[];
  for (example of state.accuracyCheckExamples) {
    const convertedAccuracyCheckExample: (string | number)[] = [];
    for (let i = 0; i < state.selectedFeatures.length; i++) {
      convertedAccuracyCheckExample.push(
        convertValueForDisplay(state, example[i], state.selectedFeatures[i]),
      );
    }
    convertedAccuracyCheckExamples.push(convertedAccuracyCheckExample);
  }
  return convertedAccuracyCheckExamples;
}
