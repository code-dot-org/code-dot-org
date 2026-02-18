import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {ValueOf} from '@cdo/apps/types/utils';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

import {modelDescriptions} from '../../constants';
import {Visibility} from '../../types';

type ModelId = ValueOf<typeof AiChatModelIds>;

const SUPPORTED_MODEL_IDS = modelDescriptions.map(model => model.id);

export const isVisible = (visibility: Visibility) =>
  visibility !== Visibility.HIDDEN;
export const isDisabled = (visibility: Visibility) =>
  visibility === Visibility.READONLY;
export const isEditable = (visibility: Visibility) =>
  visibility === Visibility.EDITABLE;

// Ensures that the given model ID is part of the available models.
// If not, returns the first available model ID.
export const validateModelId = (
  modelId: ModelId,
  allowedModelIds?: ModelId[],
  supportedModelIds = SUPPORTED_MODEL_IDS // For testing
) => {
  if (
    supportedModelIds.includes(modelId) &&
    (!allowedModelIds || allowedModelIds.includes(modelId))
  ) {
    return {isValid: true, modelId};
  }

  const supportedAndAllowed = allowedModelIds
    ? supportedModelIds.filter(id => allowedModelIds.includes(id))
    : supportedModelIds;

  if (supportedAndAllowed.length === 0) {
    Lab2Registry.getInstance()
      .getMetricsReporter()
      .logWarning(
        'No overlap between levelbuilder-allowed models and supported models. Defaulting to first supported model.'
      );
    return {isValid: false, modelId: supportedModelIds[0]};
  }

  return {isValid: false, modelId: supportedAndAllowed[0]};
};
