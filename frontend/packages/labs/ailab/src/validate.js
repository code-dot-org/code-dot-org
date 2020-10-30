/* Validation checks to determine if app set up is ready for machine learning training */

import { availableTrainers } from "./train.js";
import { ColumnTypes } from "./constants.js";

// Checks to see if there is any data.
// @return {boolean}
export function datasetUploaded(state) {
  return state.data.length > 0;
}

// Gets the names of each column in the dataset.
// @return {array} of {string} column names
export function getColumnNames(state) {
  const columnNames = datasetUploaded(state) ? Object.keys(state.data[0]) : [];
  return columnNames;
}

// Checks that each column is named.
// @return {boolean}
export function columnsNamed(state) {
  const columnNames = getColumnNames(state);
  return (
    columnNames.length > 0 &&
    !columnNames.includes("") &&
    !columnNames.includes(undefined)
  );
}

// Checks that each column is named, and that the names are unique.
// @return {boolean}
export function uniqueColumnNames(state) {
  const columnNames = getColumnNames(state);
  const uniqueColumnNames = columnNames.filter(
    (value, index, self) => self.indexOf(value) === index
  );
  return columnsNamed(state) && columnNames.length === uniqueColumnNames.length;
}

/* Iterates through the data and tracks location of empty cells.
  @return {array} of {objects} indicating where the empty cells are.
  [
    {
      row: index,
      column: columnName
    }
  ]
*/
export function emptyCellFinder(state) {
  let columns = getColumnNames(state);
  let emptyCells = [];
  state.data.forEach(function(row, i) {
    columns.forEach(function(column) {
      if (row[column] === "" || row[column] === undefined) {
        emptyCells.push({ row: i, column: column });
      }
    });
  });
  return emptyCells;
}

// Checks if there are any identified empty cells in dataset.
// @return {boolean}
export function noEmptyCells(state) {
  return datasetUploaded(state) && emptyCellFinder(state).length === 0;
}

// Checks if at least one feature is selected.
// @return {boolean}
export function minOneFeatureSelected(state) {
  return state.selectedFeatures.length !== 0;
}

// Checks if one label is selected.
// @return {boolean}
export function oneLabelSelected(state) {
  return !!state.labelColumn;
}

// Checks that the same column is not selected as both a label and a feature.
// @return {boolean}
export function uniqLabelFeaturesSelected(state) {
  return (
    minOneFeatureSelected(state) &&
    oneLabelSelected(state) &&
    !state.selectedFeatures.includes(state.labelColumn)
  );
}

// Check that each feature column and the label column contain continuous or
// categorical data, not "Other".
// @return {boolean}
export function selectedColumnsHaveDatatype(state) {
  const selectedColumns = state.selectedFeatures
    .concat(state.labelColumn)
    .filter(column => column !== undefined && column !== "");
  let columnTypesOk = true;
  for (const column of selectedColumns) {
    if (state.columnsByDataType[column] === ColumnTypes.OTHER) {
      columnTypesOk = false;
      return columnTypesOk;
    }
  }
  return selectedColumns.length > 0 && columnTypesOk;
}

// Checks that a training algorithm has been selected.
// @return {boolean}
export function trainerSelected(state) {
  return !!state.selectedTrainer;
}

/* Checks that a training algorithm and the selected label datatype are
compatible. Classification algorithms only work with categorical data, and
regression algorithms only work with continuous data.
@return {boolean}
 */
export function compatibleLabelAndTrainer(state) {
  const labelAndTrainerSelected =
    oneLabelSelected(state) && trainerSelected(state);
  const trainerLabelType = state.selectedTrainer
    ? availableTrainers[state.selectedTrainer].labelType
    : undefined;
  const labelDatatype = state.labelColumn
    ? state.columnsByDataType[state.labelColumn]
    : undefined;
  const compatible = labelAndTrainerSelected
    ? trainerLabelType === labelDatatype
    : false;
  return compatible;
}
