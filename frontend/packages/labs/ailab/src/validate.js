/* Validation checks to determine if app set up is ready for machine learning training */

// Gets the names of each column in the dataset.
// @return {array} of {string} column names
function getColumnNames(state) {
  const columnNames = datasetUploaded(state) ? Object.keys(state.data[0]) : [];
  return columnNames;
}

// Checks that each column is named.
// @return {boolean}
function columnsNamed(state) {
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

// Checks if at least one feature is selected.
// @return {boolean}
function minOneFeatureSelected(state) {
  return state.selectedFeatures.length !== 0;
}

// Checks if one label is selected.
// @return {boolean}
function oneLabelSelected(state) {
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
