import { createSelector } from 'reselect';
import { ColumnTypes } from "./constants.js";

const getColumnsByDataType = state => state.columnsByDataType;
const getSelectedFeatures = state => state.selectedFeatures;

/* Functions for filtering and selecting columns by type.  */

const getCategoricalColumns = createSelector(
  [getColumnsByDataType],
  (columnsByDataType) => {
    return Object.keys(columnsByDataType).filter(
      column => columnsByDataType[column] === ColumnTypes.CATEGORICAL
    );
  }
)

export const getSelectedCategoricalFeatures = createSelector(
  [getCategoricalColumns, getSelectedFeatures],
  (categoricalColumns, selectedFeatures) => {
    return categoricalColumns.filter(
      x => selectedFeatures.includes(x)
    );
  }
)

const getNumericalColumns = createSelector(
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
      x => selectedFeatures.includes(x)
    );
  }
)
