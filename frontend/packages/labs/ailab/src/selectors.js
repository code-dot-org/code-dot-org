import { createSelector } from 'reselect';
import { ColumnTypes } from "./constants.js";

const getData = state => state.data;
const getColumnsByDataType = state => state.columnsByDataType;
const getSelectedFeatures = state => state.selectedFeatures;
const getLabelColumn = state => state.labelColumn;

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

export const getUniqueOptionsByColumn = createSelector(
  [getSelectedCategoricalColumns, getData],
  (selectedCategoricalColumns, data) => {
    let uniqueOptionsByColumn = {};
    selectedCategoricalColumns.map(column => (
      uniqueOptionsByColumn[column] = Array.from(
        new Set(data.map(row => row[column]))
      ).sort()
    ))
    return uniqueOptionsByColumn;
  }
)
