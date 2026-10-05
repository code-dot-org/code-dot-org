import {getRandomInt} from './utils';

interface PredictInputColumns {
  numericalFeatures: string[];
  categoricalFeatures: string[];
  extremaByColumn: Record<string, {min: number; max: number}>;
  decimalPlacesByColumn: Record<string, number>;
  uniqueOptionsByColumn: Record<string, string[]>;
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

export function getRandomPredictInputs({
  numericalFeatures,
  categoricalFeatures,
  extremaByColumn,
  decimalPlacesByColumn,
  uniqueOptionsByColumn,
}: PredictInputColumns): Record<string, string> {
  return Object.fromEntries([
    ...numericalFeatures.map(feature => [
      feature,
      randomNumberBetween(
        extremaByColumn[feature].min,
        extremaByColumn[feature].max,
        decimalPlacesByColumn[feature],
      ),
    ]),
    ...categoricalFeatures.map(feature => [
      feature,
      randomOption(uniqueOptionsByColumn[feature]),
    ]),
  ]);
}
