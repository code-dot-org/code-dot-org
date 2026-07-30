/* Helper functions for getting information about a column and its data. */

import {ColumnTypes, UNIQUE_OPTIONS_MAX} from '../constants';
import I18n from '../i18n';
import type {RootState} from '../redux';
import type {
  DataRow,
  BoxPlotStats,
  HistogramBin,
  Metadata,
  MetadataField,
  TrainedModelDetailsSave,
  ModelCardColumn,
} from '../types';

export interface Extrema {
  max: number;
  min: number;
  range: number;
}

export function isColumnCategorical(state: RootState, column: string): boolean {
  return state.columnsByDataType[column] === ColumnTypes.CATEGORICAL;
}

export function isColumnNumerical(state: RootState, column: string): boolean {
  return state.columnsByDataType[column] === ColumnTypes.NUMERICAL;
}

export function isRegression(state: RootState): boolean {
  return isColumnNumerical(state, state.labelColumn!);
}

export function filterColumnsByType(
  columnsByDataType: Record<string, string>,
  columnType: string,
): string[] {
  return Object.keys(columnsByDataType).filter(
    column => columnsByDataType[column] === columnType,
  );
}
/*
  Categorical columns with too many unique values are unlikley to make
  accurate models, and we don't want to overflow the metadata column for saved
  models.
*/
export function tooManyUniqueOptions(uniqueOptionsCount: number): boolean {
  return uniqueOptionsCount > UNIQUE_OPTIONS_MAX;
}

export function getUniqueOptions(
  data: DataRow[],
  column: string,
): (string | number)[] {
  const columnData = getColumnData(data, column);
  return Array.from(new Set(columnData)).filter(
    option => option !== undefined && option !== '',
  );
}

export function isColumnReadOnly(metadata: Metadata, column: string): boolean {
  const metadataColumnType =
    column &&
    metadata &&
    metadata.fields &&
    metadata.fields.find((field: MetadataField) => {
      return field.id === column;
    })?.type;
  return !!metadataColumnType;
}

function getColumnData(data: DataRow[], column: string): (string | number)[] {
  return data.map(row => row[column]);
}

function formatChartNumber(value: number): string {
  if (Number.isInteger(value)) {
    return String(value);
  }

  return String(Number(value.toFixed(2)));
}

export function getNumericalValues(data: DataRow[], column: string): number[] {
  return getColumnData(data, column).map(Number);
}

export function getExtrema(data: DataRow[], column: string): Extrema {
  const numericData = getNumericalValues(data, column);
  const extrema: Extrema = {
    max: Math.max(...numericData),
    min: Math.min(...numericData),
    range: 0,
  };
  extrema.range = Math.abs(extrema.max - extrema.min);

  return extrema;
}

export function containsOnlyNumbers(data: DataRow[], column: string): boolean {
  const columnData = getColumnData(data, column);
  return columnData.every(cell => !isNaN(Number(cell)));
}

function getQuantile(sortedValues: number[], quantile: number): number {
  if (sortedValues.length === 0) {
    return NaN;
  }

  const index = (sortedValues.length - 1) * quantile;
  const lowerIndex = Math.floor(index);
  const upperIndex = Math.ceil(index);
  const weight = index - lowerIndex;

  return (
    sortedValues[lowerIndex] * (1 - weight) + sortedValues[upperIndex] * weight
  );
}

export function getBoxPlotStats(
  data: DataRow[],
  column: string,
): BoxPlotStats | undefined {
  const sortedValues = getNumericalValues(data, column).sort((a, b) => a - b);
  if (sortedValues.length === 0 || sortedValues.some(value => isNaN(value))) {
    return undefined;
  }

  return {
    min: sortedValues[0],
    q1: getQuantile(sortedValues, 0.25),
    median: getQuantile(sortedValues, 0.5),
    q3: getQuantile(sortedValues, 0.75),
    max: sortedValues[sortedValues.length - 1],
  };
}

export function getHistogramBins(
  data: DataRow[],
  column: string,
  binCount = 6,
): HistogramBin[] {
  const numericData = getNumericalValues(data, column);
  if (
    numericData.length === 0 ||
    binCount <= 0 ||
    numericData.some(value => isNaN(value))
  ) {
    return [];
  }

  const min = Math.min(...numericData);
  const max = Math.max(...numericData);
  if (min === max) {
    return [
      {
        label: formatChartNumber(min),
        min,
        max,
        count: numericData.length,
      },
    ];
  }

  const bucketCount = Math.min(binCount, numericData.length);
  const binSize = (max - min) / bucketCount;
  const bins: HistogramBin[] = Array.from({length: bucketCount}, (_, index) => {
    const binMin = min + index * binSize;
    const binMax = index === bucketCount - 1 ? max : binMin + binSize;
    return {
      label: `${formatChartNumber(binMin)}-${formatChartNumber(binMax)}`,
      min: binMin,
      max: binMax,
      count: 0,
    };
  });

  for (const value of numericData) {
    const binIndex =
      value === max ? bucketCount - 1 : Math.floor((value - min) / binSize);
    bins[binIndex].count++;
  }

  return bins;
}

export function getColumnDescription(
  columnId: string,
  metadata: Metadata,
  trainedModelDetails: TrainedModelDetailsSave,
): string | null {
  // Use metadata if available.
  if (columnId && metadata && metadata.fields) {
    const field = metadata.fields.find((field: MetadataField) => {
      return field.id === columnId;
    });
    return getLocalizedColumnDescription(
      metadata.name!,
      columnId,
      field?.description ?? '',
    );
  }

  // Try using a user-entered column description if available.
  if (trainedModelDetails && trainedModelDetails.columns) {
    const matchedColumn = trainedModelDetails.columns.find(
      (column: {id: string; description: string}) => {
        return column.id === columnId;
      },
    );
    if (matchedColumn) {
      return matchedColumn.description;
    }
  }

  // No column description available.
  return null;
}

/* Builds a hash that maps a feature's categorical options to numbers because
  the ML algorithms only accept numerical inputs.
  @param {string} - feature name
  @return {
    option1 : 0,
    option2 : 1,
    option3: 2,
    ...
  }
  */
export function buildOptionNumberKey(
  state: RootState,
  feature: string,
): Record<string, number> {
  const optionsMappedToNumbers: Record<string, number> = {};
  const uniqueOptions = getUniqueOptions(state.data, feature);
  uniqueOptions.forEach(
    (option: string | number) =>
      (optionsMappedToNumbers[String(option)] = uniqueOptions.indexOf(option)),
  );
  return optionsMappedToNumbers;
}

export function getColumnDataToSave(
  state: RootState,
  column: string,
): ModelCardColumn {
  const columnData: ModelCardColumn = {id: column};
  columnData.description =
    getColumnDescription(column, state.metadata, state.trainedModelDetails) ??
    undefined;
  if (isColumnCategorical(state, column)) {
    columnData.values = getUniqueOptions(state.data, column).map(String);
  } else if (isColumnNumerical(state, column)) {
    const {max, min} = getExtrema(state.data, column);
    columnData.max = max;
    columnData.min = min;
  }
  return columnData;
}

export function getLocalizedColumnName(
  datasetId: string,
  columnId: string,
): string {
  return getLocalizedColumnAttr(datasetId, columnId, 'id', columnId);
}

function getLocalizedColumnDescription(
  datasetId: string,
  columnId: string,
  description: string,
): string {
  return getLocalizedColumnAttr(
    datasetId,
    columnId,
    'description',
    description,
  );
}

function getLocalizedColumnAttr(
  datasetId: string,
  columnId: string,
  attribute: string,
  fallback: string,
): string {
  return (
    I18n.t(attribute, {
      scope: ['datasets', datasetId, 'fields', columnId],
      default: fallback,
    }) ?? fallback
  );
}
