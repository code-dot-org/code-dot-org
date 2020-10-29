/* Validation checks to determine if app set up is ready for machine learning training */

import { availableTrainers } from "./train.js";
import { ColumnTypes } from "./constants.js";

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
