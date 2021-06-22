import { createSelector } from 'reselect';
import { ColumnTypes } from "./constants.js";

const getData = state => state.data;
const getColumnsByDataType = state => state.columnsByDataType;
const getSelectedFeatures = state => state.selectedFeatures;
const getLabelColumn = state => state.labelColumn;
const getCurrentColumn = state => state.currentColumn;

/* Functions for filtering and selecting columns by type.  */

export const getCategoricalColumns = createSelector(
  [getColumnsByDataType],
  (columnsByDataType) => {
    return Object.keys(columnsByDataType).filter(
      column => columnsByDataType[column] === ColumnTypes.CATEGORICAL
    );
  }
)

export const getSelectedCategoricalColumns = createSelector(
  [getCategoricalColumns, getSelectedFeatures, getLabelColumn],
  (categoricalColumns, selectedFeatures, labelColumn) => {
    return categoricalColumns.filter(
      column => (selectedFeatures.includes(column) || column === labelColumn)
    )
  }
)

export const getSelectedCategoricalFeatures = createSelector(
  [getCategoricalColumns, getSelectedFeatures],
  (categoricalColumns, selectedFeatures) => {
    return categoricalColumns.filter(
      column => selectedFeatures.includes(column)
    );
  }
)

export const getNumericalColumns = createSelector(
  [getColumnsByDataType],
  (columnsByDataType) => {
    return Object.keys(columnsByDataType).filter(
      column => columnsByDataType[column] === ColumnTypes.NUMERICAL
    );
  }
)

export const getSelectedNumericalFeatures = createSelector(
  [getNumericalColumns, getSelectedFeatures],
  (numericalColumns, selectedFeatures) => {
    return numericalColumns.filter(
      column => selectedFeatures.includes(column)
    );
  }
)

function getUniqueOptions(data, column) {
  return Array.from(new Set(data.map(row => row[column]))).filter(
    option => option !== undefined && option !== ""
  );
}

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

export const getUniqueOptionsCurrentColumn = createSelector(
  [getCurrentColumn, getData],
  (currentColumn, data) => {
    return getUniqueOptions(data, currentColumn).sort()
  }
)
