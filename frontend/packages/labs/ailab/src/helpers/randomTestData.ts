import type {RootState} from '../redux';
import {
  getExtremaByColumn,
  getSelectedCategoricalFeatures,
  getSelectedNumericalFeatures,
  getUniqueOptionsByColumn,
} from '../selectors';
import type {DataRow} from '../types';

import {getRandomInt} from './utils';

function countDecimalPlaces(value: string | number): number {
  return String(value).split('.')[1]?.length ?? 0;
}

function getDecimalPlaces(data: DataRow[], column: string): number {
  return Math.max(...data.map(row => countDecimalPlaces(row[column])));
}

function randomNumberBetween(
  min: number,
  max: number,
  decimalPlaces: number,
): string {
  const scale = 10 ** decimalPlaces;
  const steps = Math.round((max - min) * scale);
  return (min + getRandomInt(steps + 1) / scale).toFixed(decimalPlaces);
}

function randomOption(options: string[]): string {
  return options[getRandomInt(options.length)];
}

export function getRandomTestData(state: RootState): Record<string, string> {
  const extremaByColumn = getExtremaByColumn(state);
  const uniqueOptionsByColumn = getUniqueOptionsByColumn(state);

  return Object.fromEntries([
    ...getSelectedNumericalFeatures(state).map(feature => [
      feature,
      randomNumberBetween(
        extremaByColumn[feature].min,
        extremaByColumn[feature].max,
        getDecimalPlaces(state.data, feature),
      ),
    ]),
    ...getSelectedCategoricalFeatures(state).map(feature => [
      feature,
      randomOption(uniqueOptionsByColumn[feature]),
    ]),
  ]);
}
