import {ValueOf} from '@cdo/apps/types/utils';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

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
export const validateModelId = (modelId: ValueOf<typeof AiChatModelIds>) => {
  const availableModelIds = modelDescriptions.map(model => model.id);
  if (availableModelIds.includes(modelId)) {
    return modelId;
  }

  return availableModelIds[0];
};
