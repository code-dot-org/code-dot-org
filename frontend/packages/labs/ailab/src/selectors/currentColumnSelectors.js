import { createSelector } from 'reselect';
import {
  getUniqueOptions,
  getExtrema,
  isColumnReadOnly,
  getColumnDescription,
  hasTooManyUniqueOptions,
  containsOnlyNumbers
} from '../helpers/columnDetails';
import {
  getSelectedColumns,
  getData,
  getColumnsByDataType,
  getMetadata,
  getTrainedModelDetails
 } from '../selectors';
import { ColumnTypes } from "../constants.js";

const getCurrentColumn = state => state.currentColumn;

export const getCurrentColumnDetails = createSelector(
  [
    getCurrentColumn,
    (state, props) => isCurrentColumnReadOnly(state, props),
    getColumnsByDataType,
    (state, props) => getCurrentColumnDescription(state, props),
    (state, props) => isCurrentColumnSelectable(state, props)
  ],
  (
    currentColumn,
    isReadOnly,
    columnsByDataType,
    description,
    isSelectable
  ) => {
    if (currentColumn) {
      return {
        id: currentColumn,
        readOnly: isReadOnly,
        dataType: columnsByDataType[currentColumn],
        description: description,
        isSelectable: isSelectable
      };
    }
  }
)

export const isCurrentColumnReadOnly = createSelector(
  [getCurrentColumn, getMetadata],
  (currentColumn, metadata) => {
    return isColumnReadOnly(metadata, currentColumn)
  }
)

export const getCurrentColumnDescription = createSelector(
  [getCurrentColumn, getMetadata, getTrainedModelDetails],
  (currentColumn, metadata, trainedModelDetails) => {
    return getColumnDescription(currentColumn, metadata, trainedModelDetails);
  }
)

export const isCurrentColumnSelectable = createSelector(
  [
    (state, props) => isCurrentColumnSelected(state, props),
    (state, props) => isValidData(state, props)
  ],
  (selected, isValidData) => {
    return !selected && isValidData;
  }
)

export const isCurrentColumnSelected = createSelector(
  [getSelectedColumns, getCurrentColumn],
  (selectedColumns, currentColumn) => {
    return selectedColumns.includes(currentColumn);
  }
)

export const isValidData = createSelector(
  [
    (state, props) => isValidNumericalData(state, props),
    (state, props) => isValidCategoricalData(state, props)
  ],
  (isValidNumericalData, isValidCategoricalData) => {
    return isValidNumericalData || isValidCategoricalData;
  }
)

export const getNumericalColumnDetails = createSelector(
  [
    getCurrentColumn,
    (state, props) => currentColumnIsNumerical(state, props),
    (state, props) => getExtremaCurrentColumn(state, props),
    (state, props) => currentColumnContainsOnlyNumbers(state, props)
  ],
  (
    currentColumn,
    isNumerical,
    extrema,
    containsOnlyNumbers
  ) => {
    const numericalColumnDetails = {};
    numericalColumnDetails.id = currentColumn;
    if (isNumerical) {
      numericalColumnDetails.extrema = extrema;
      numericalColumnDetails.containsOnlyNumbers = containsOnlyNumbers;
    }
    return numericalColumnDetails;
  }
)

export const currentColumnIsNumerical = createSelector(
  [getCurrentColumn, getColumnsByDataType],
  (currentColumn, columnsByDataType) => {
    return columnsByDataType[currentColumn] === ColumnTypes.NUMERICAL;
  }
)

export const getExtremaCurrentColumn = createSelector(
  [getCurrentColumn, getData],
  (currentColumn, data) => {
    return getExtrema(data, currentColumn);
  }
)

export const currentColumnContainsOnlyNumbers = createSelector(
  [getCurrentColumn, getData],
  (currentColumn, data) => {
    return containsOnlyNumbers(data, currentColumn);
  }
)

export const isValidNumericalData = createSelector(
  [currentColumnIsNumerical, currentColumnContainsOnlyNumbers],
  (isNumerical, containsOnlyNumbers) => {
    return isNumerical && containsOnlyNumbers;
  }
)

export const getCategoricalColumnDetails = createSelector(
  [
    getCurrentColumn,
    (state, props) => currentColumnIsCategorical(state, props),
    (state, props) => getUniqueOptionsCurrentColumn(state, props),
    (state, props) => getOptionFrequenciesCurrentColumn(state, props)
  ],
  (
    currentColumn,
    isCategorical,
    uniqueOptions,
    uniqueOptionFrequencies
  ) => {
    const categeoricalColumnDetails = {};
    categeoricalColumnDetails.id = currentColumn;
    if (isCategorical) {
      categeoricalColumnDetails.uniqueOptions = uniqueOptions;
      categeoricalColumnDetails.frequencies = uniqueOptionFrequencies;
    }
    return categeoricalColumnDetails;
  }
)

export const getUniqueOptionsCurrentColumn = createSelector(
  [getCurrentColumn, getData],
  (currentColumn, data) => {
    return getUniqueOptions(data, currentColumn).sort()
  }
)

export const getOptionFrequenciesCurrentColumn = createSelector(
  [getCurrentColumn, getData],
  (currentColumn, data) => {
    let optionFrequencies = {};
    for (let row of data) {
      if (optionFrequencies[row[currentColumn]]) {
        optionFrequencies[row[currentColumn]]++;
      } else {
        optionFrequencies[row[currentColumn]] = 1;
      }
    }
    return optionFrequencies;
  }
)

export const currentColumnIsCategorical = createSelector(
  [getCurrentColumn, getColumnsByDataType],
  (currentColumn, columnsByDataType) => {
    return columnsByDataType[currentColumn] === ColumnTypes.CATEGORICAL;
  }
)

export const isValidCategoricalData = createSelector(
  [currentColumnIsCategorical, hasTooManyUniqueOptions],
  (isCategorical, hasTooManyUniqueOptions) => {
    return isCategorical && !hasTooManyUniqueOptions;
  }
)
