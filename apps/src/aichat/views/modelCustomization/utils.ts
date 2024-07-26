import {modelDescriptions} from '../../constants';
import {Visibility} from '../../types';

export const isVisible = (visibility: Visibility) =>
  visibility !== Visibility.HIDDEN;
export const isDisabled = (visibility: Visibility) =>
  visibility === Visibility.READONLY;
export const isEditable = (visibility: Visibility) =>
  visibility === Visibility.EDITABLE;

// Ensures that the given model ID is part of the available models.
// If not, returns the first available model ID.
export const validateModelId = (modelId: string): string => {
  const availableModelIds = modelDescriptions.map(model => model.id);
  if (availableModelIds.includes(modelId)) {
    return modelId;
  }

  return availableModelIds[0];
};
