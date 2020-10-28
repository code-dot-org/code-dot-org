/* Validation checks to determine if app set up is ready for machine learning training */

import { availableTrainers } from "./train.js";

export function datasetUploaded(state) {
  return state.data.length > 0;
}

export function getColumnNames(state) {
  const columnNames = datasetUploaded(state) ? Object.keys(state.data[0]) : [];
  return columnNames;
}

export function columnsNamed(state) {
  const columnNames = getColumnNames(state);
  return (
    columnNames.length > 0 &&
    !columnNames.includes("") &&
    !columnNames.includes(undefined)
  );
}

export function uniqueColumnNames(state) {
  const columnNames = getColumnNames(state);
  const uniqueColumnNames = columnNames.filter(
    (value, index, self) => self.indexOf(value) === index
  );
  return columnsNamed(state) && columnNames.length === uniqueColumnNames.length;
}

export function minOneFeatureSelected(state) {
  return state.selectedFeatures.length !== 0;
}

export function oneLabelSelected(state) {
  return !!state.labelColumn;
}

export function uniqLabelFeaturesSelected(state) {
  return (
    minOneFeatureSelected(state) &&
    oneLabelSelected(state) &&
    !state.selectedFeatures.includes(state.labelColumn)
  );
}

export function trainerSelected(state) {
  return !!state.selectedTrainer;
}

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
