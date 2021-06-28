import { createSelector } from 'reselect';
import { ColumnTypes } from "./constants.js";
import {
  getUniqueOptions,
  getExtrema,
  isColumnReadOnly,
  getColumnDescription,
  hasTooManyUniqueOptions
} from './helpers/columnDetails';
import { arrayIntersection } from './helpers/utils';
import { filterColumnsByType } from './redux';

const getData = state => state.data;
const getColumnsByDataType = state => state.columnsByDataType;
const getSelectedFeatures = state => state.selectedFeatures;
const getLabelColumn = state => state.labelColumn;
const getCurrentColumn = state => state.currentColumn;
const getMetadata = state => state.metadata;
const getTrainedModelDetails = state => state.trainedModelDetails;

export const getCategoricalColumns = createSelector(
  [getColumnsByDataType],
  (columnsByDataType) => {
    return filterColumnsByType(columnsByDataType, ColumnTypes.CATEGORICAL);
  }
)

export const getSelectedColumns = createSelector(
  [getSelectedFeatures, getLabelColumn],
  (selectedFeatures, labelColumn) => {
    selectedFeatures.push(labelColumn)
    return selectedFeatures;
  }
)

export const getSelectedCategoricalColumns = createSelector(
  [getCategoricalColumns, getSelectedColumns],
  (categoricalColumns, selectedColumns) => {
    return arrayIntersection(categoricalColumns, selectedColumns);
  }
)

export const getSelectedCategoricalFeatures = createSelector(
  [getCategoricalColumns, getSelectedFeatures],
  (categoricalColumns, selectedFeatures) => {
    return arrayIntersection(categoricalColumns, selectedFeatures);
  }
)

export const getNumericalColumns = createSelector(
  [getColumnsByDataType],
  (columnsByDataType) => {
    return filterColumnsByType(columnsByDataType, ColumnTypes.NUMERICAL);
  }
)

export const getSelectedNumericalColumns = createSelector(
  [getNumericalColumns, getSelectedColumns],
  (numericalColumns, selectedColumns) => {
    return arrayIntersection(numericalColumns, selectedColumns);
  }
)

export const getSelectedNumericalFeatures = createSelector(
  [getNumericalColumns, getSelectedFeatures],
  (numericalColumns, selectedFeatures) => {
    return arrayIntersection(numericalColumns, selectedFeatures);
  }
)

export const getUniqueOptionsByColumn = createSelector(
  [getSelectedCategoricalColumns, getData],
  (selectedCategoricalColumns, data) => {
    let uniqueOptionsByColumn = {};
    selectedCategoricalColumns.map(column => (
      uniqueOptionsByColumn[column] = getUniqueOptions(data, column).sort()
    ))
    return uniqueOptionsByColumn;
  }
)

export const getUniqueOptionsLabelColumn = createSelector(
  [getLabelColumn, getData],
  (labelColumn, data) => {
    return getUniqueOptions(data, labelColumn).sort()
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

export const getExtremaByColumn = createSelector(
  [getSelectedNumericalColumns, getData],
  (getSelectedNumericalColumns, data) => {
    let extremaByColumn = {};
    getSelectedNumericalColumns.map(column => (
      extremaByColumn[column] = getExtrema(data, column)
    ))
    return extremaByColumn;
  }
)

export const getCurrentColumnData = createSelector(
  [getCurrentColumn, getData],
  (currentColumn, data) => {
    return data.map(row => row[column]);
  }
)
export const getExtremaCurrentColumn = createSelector(
  [getCurrentColumnData],
  (currentColumnData) => {
    return getExtrema(currentColumnData);
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

export const getSelectedColumnsDescriptions = createSelector(
  [getSelectedColumns, getMetadata, getTrainedModelDetails],
  (selectedColumns, metadata, trainedModelDetails) => {
    return selectedColumns.map(column => {
      return {
        id: column,
        description: getColumnDescription(
          column,
          metadata,
          trainedModelDetails
        )
      };
    });
  }
)

export const isCurrentColumnSelectable = createSelector(
  [getSelectedColumns, getCurrentColumn],
  (selectedColumns, currentColumn) => {
    return !selectedColumns.includes(currentColumn);
  }
)

export const currentColumnContainsOnlyNumbers = createSelector(
  [getCurrentColumnData],
  (currentColumnData) => {
    return containsOnlyNumbers(currentColumnData);
  }
)

export const getCategoricalColumnDetails = createSelector(
  [
    getCurrentColumn,
    getColumnsByDataType,
    getUniqueOptionsCurrentColumn,
    getOptionFrequenciesCurrentColumn
  ],
  (
    currentColumn,
    columnsByDataType,
    uniqueOptions,
    uniqueOptionFrequencies
  ) => {
    const categeoricalColumnDetails = {};
    categeoricalColumnDetails.id = currentColumn;
    const isCategorical = columnDetails.dataType === ColumnTypes.CATEGORICAL;
    if (isCategorical) {
      const uniqueOptions = uniqueOptions;
      const hasTooManyUniqueOptions = hasTooManyUniqueOptions(
        uniqueOptions.length
      );
      categeoricalColumnDetails.uniqueOptions = uniqueOptions;
      categeoricalColumnDetails.hasTooManyUniqueOptions =
        hasTooManyUniqueOptions;
      categeoricalColumnDetails.frequencies = uniqueOptionFrequencies;
    }
    return categeoricalColumnDetails;
  }
)

export const getNumericalColumnDetails = createSelector(
  [
    getCurrentColumn,
    getColumnsByDataType,
    getExtremaCurrentColumn,
    currentColumnContainsOnlyNumbers
  ],
  (
    currentColumn,
    columnsByDataType,
    description,
    extrema,
    containsOnlyNumbers
  ) => {
    const categeoricalColumnDetails = {};
    categeoricalColumnDetails.id = currentColumn;
    const isNumerical = columnDetails.dataType === ColumnTypes.NUMERICAL;
    if (isNumerical) {
      columnDetails.extrema = extrema;
      columnDetails.containsOnlyNumbers = containsOnlyNumbers;
    }
    return columnDetails;
  }
)

export const getCurrentColumnDetails = createSelector(
  [
    getCurrentColumn,
    isCurrentColumnReadOnly,
    getColumnsByDataType,
    getCurrentColumnDescription,
    isCurrentColumnSelectable
  ],
  (
    currentColumn,
    isReadOnly,
    columnsByDataType,
    description,
    isSelectable
  ) => {

    return {
      id: currentColumn,
      readOnly: isReadOnly,
      dataType: columnsByDataType[currentColumn],
      description: description,
      isSelectable: isSelectable
    };
  }
)
