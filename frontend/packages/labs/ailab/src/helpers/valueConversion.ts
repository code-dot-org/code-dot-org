/*
  The machine learning algorithms we're using only process numerical data. We
  convert categorical strings into ordinal integers to pass to the algorithm and
  likewise convert the returned integers back into human-readable strings.
*/
import type {RootState} from '../redux';
import {getSelectedCategoricalColumns} from '../selectors';
import type {AilabProject} from '../types';

import {isEmpty, getKeyByValue} from './utils';

// Take a ML-friendly integer and convert to human-readable string.
export function convertValueForDisplay(
  state: RootState,
  project: AilabProject,
  value: string | number,
  column: string
): string | number {
  const convertedValue =
    getSelectedCategoricalColumns(state, project).includes(column) &&
    !isEmpty(state.featureNumberKey)
      ? getKeyByValue(state.featureNumberKey[column], value as number)
      : value;
  return convertedValue ?? value;
}

// Take a human-readable string and convert to a ML-friendly integer.
export function convertValueForTraining(
  state: RootState,
  project: AilabProject,
  value: string | number,
  column: string
): number {
  const convertedValue = getSelectedCategoricalColumns(state, project).includes(
    column
  )
    ? state.featureNumberKey[column][String(value)]
    : parseFloat(String(value));
  return convertedValue;
}

export function getConvertedPredictedLabel(
  state: RootState,
  project: AilabProject
): string | number {
  return convertValueForDisplay(
    state,
    project,
    state.prediction as string | number,
    project.labelColumn!
  );
}

export function getConvertedLabels(
  state: RootState,
  project: AilabProject,
  rawLabels: (number | string)[] = []
): (string | number)[] {
  return rawLabels.map(label =>
    convertValueForDisplay(state, project, label, project.labelColumn!)
  );
}

export function getConvertedAccuracyCheckExamples(
  state: RootState,
  project: AilabProject
): (string | number)[][] {
  const convertedAccuracyCheckExamples: (string | number)[][] = [];
  let example: number[];
  for (example of state.accuracyCheckExamples) {
    const convertedAccuracyCheckExample: (string | number)[] = [];
    for (let i = 0; i < project.selectedFeatures.length; i++) {
      convertedAccuracyCheckExample.push(
        convertValueForDisplay(
          state,
          project,
          example[i],
          project.selectedFeatures[i]
        )
      );
    }
    convertedAccuracyCheckExamples.push(convertedAccuracyCheckExample);
  }
  return convertedAccuracyCheckExamples;
}
