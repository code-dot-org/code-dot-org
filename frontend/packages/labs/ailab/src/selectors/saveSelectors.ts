/* Builds the model-card payload that the consumer persists. */

import {getSummaryStat} from '../helpers/accuracy';
import {getColumnDataToSave} from '../helpers/columnDetails';
import {getDatasetDetails} from '../helpers/datasetDetails';
import type {RootState} from '../redux';
import {getTrainerId} from '../trainers/ids';
import type {
  AilabProject,
  ModelCardColumn,
  ModelDataToSave,
  TrainedModel,
} from '../types';

export function getFeaturesToSave(state: RootState): ModelCardColumn[] {
  const features = state.selectedFeatures.map(feature =>
    getColumnDataToSave(state, feature),
  );
  return features;
}

export function getLabelToSave(state: RootState): ModelCardColumn {
  return getColumnDataToSave(state, state.labelColumn!);
}

export function getTrainedModelDataToSave(
  state: RootState,
  project: AilabProject,
  trainedModel?: TrainedModel,
): ModelDataToSave {
  const dataToSave: ModelDataToSave = {
    name: state.trainedModelDetails.name,
    datasetDetails: getDatasetDetails(state),
    potentialUses: state.trainedModelDetails.potentialUses,
    potentialMisuses: state.trainedModelDetails.potentialMisuses,
    selectedTrainer: getTrainerId(state),
    featureNumberKey: state.featureNumberKey,
    label: getColumnDataToSave(state, state.labelColumn!),
    features: getFeaturesToSave(state),
    summaryStat: getSummaryStat(state),
    trainedModel: trainedModel ? trainedModel.toJSON() : null,
    hyperparameters: project.hyperparameters ?? null,
  };

  return dataToSave;
}
