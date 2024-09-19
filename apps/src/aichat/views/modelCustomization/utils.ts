import {ValueOf} from '@cdo/apps/types/utils';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

import {modelDescriptions} from '../../constants';
import {AiCustomizations, ToxicityCheckedField, Visibility} from '../../types';

import {FIELDS_CHECKED_FOR_TOXICITY} from './constants';

export const isVisible = (visibility: Visibility) =>
  visibility !== Visibility.HIDDEN;
export const isDisabled = (visibility: Visibility) =>
  visibility === Visibility.READONLY;
export const isEditable = (visibility: Visibility) =>
  visibility === Visibility.EDITABLE;

// Ensures that the given model ID is part of the available models.
// If not, returns the first available model ID.
export const validateModelId = (modelId: ValueOf<typeof AiChatModelIds>) => {
  const availableModelIds = modelDescriptions.map(model => model.id);
  if (availableModelIds.includes(modelId)) {
    return modelId;
  }

  return availableModelIds[0];
};

export const extractFieldsToCheckForToxicity = (
  customizations: AiCustomizations
) => {
  return FIELDS_CHECKED_FOR_TOXICITY.reduce((acc, field) => {
    if (customizations[field]) {
      acc[field] = customizations[field];
    }
    return acc;
  }, {} as {[key in ToxicityCheckedField]: string | string[]});
};
