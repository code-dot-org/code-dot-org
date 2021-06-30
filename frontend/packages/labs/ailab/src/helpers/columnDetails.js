/* Helper functions for getting information about a column and its data. */

import { ColumnTypes, UNIQUE_OPTIONS_MAX } from "../constants.js";

export function isColumnCategorical(state, column) {
  return (state.columnsByDataType[column] === ColumnTypes.CATEGORICAL);
}

export function isColumnNumerical(state, column) {
  return (state.columnsByDataType[column] === ColumnTypes.NUMERICAL);
}

export function filterColumnsByType(columnsByDataType, columnType) {
  return Object.keys(columnsByDataType).filter(
    column => columnsByDataType[column] === columnType
  );
}
/*
  Categorical columns with too many unique values are unlikley to make
  accurate models, and we don't want to overflow the metadata column for saved
  models.
*/
export function tooManyUniqueOptions(uniqueOptionsCount) {
  return uniqueOptionsCount > UNIQUE_OPTIONS_MAX;
}

export function getUniqueOptions(data, column) {
  const columnData = getColumnData(data, column);
  return Array.from(new Set(columnData)).filter(
    option => option !== undefined && option !== ""
  );
}

export function isColumnReadOnly(metadata, column) {
  const metadataColumnType =
    column &&
    metadata &&
    metadata.fields &&
    metadata.fields.find(field => {
      return field.id === column;
    }).type;
  return !!metadataColumnType;
}

function getColumnData(data, column) {
  return data.map(row => row[column]);
}

export function getExtrema(data, column) {
  const columnData = getColumnData(data, column);
  let extrema = {};
  extrema.max = Math.max(...columnData);
  extrema.min = Math.min(...columnData);
  extrema.range = Math.abs(extrema.max - extrema.min);

  return extrema;
}

export function containsOnlyNumbers(data, column) {
  const columnData = getColumnData(data, column);
  return columnData.every(cell => !isNaN(cell));
}

export function getColumnDescription(column, metadata, trainedModelDetails) {
  // Use metadata if available.
  if (column && metadata && metadata.fields) {
    const field = metadata.fields.find(field => {
      return field.id === column;
    });
    return field.description;
  }

  // Try using a user-entered column description if available.
  if (trainedModelDetails && trainedModelDetails.columns) {
    const matchedColumn = trainedModelDetails.columns.find(col => {
      return col.id === column;
    });
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
export function buildOptionNumberKey(state, feature) {
  let optionsMappedToNumbers = {};
  const uniqueOptions = getUniqueOptions(state.data, feature);
  uniqueOptions.forEach(
    option => (optionsMappedToNumbers[option] = uniqueOptions.indexOf(option))
  );
  return optionsMappedToNumbers;
}

export function getColumnDataToSave(state, column) {
  const columnData = {};
  columnData.id = column;
  columnData.description = getColumnDescription(column, state.metadata, state.trainedModelDetails);
  if (isColumnCategorical(state, column)) {
    columnData.values = getUniqueOptions(state.data, column);
  } else if (isColumnNumerical(state, column)) {
    const {max, min} = getExtrema(state.data, column);
    columnData.max = max;
    columnData.min = min;
  }
  return columnData;
}
