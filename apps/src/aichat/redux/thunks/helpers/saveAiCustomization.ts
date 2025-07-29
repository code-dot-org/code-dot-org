import {detectToxicityInCustomizations} from '@cdo/apps/aichat/aichatApi';
import {
  AiCustomizations,
  DetectToxicityResponse,
  FlaggedField,
  SaveType,
} from '@cdo/apps/aichat/types';
import {extractFieldsToCheckForToxicity} from '@cdo/apps/aichat/utils';
import {AI_CUSTOMIZATIONS_LABELS} from '@cdo/apps/aichat/views/modelCustomization/constants';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {AppDispatch} from '@cdo/apps/util/reduxHooks';

import {startSave} from '../../slice';

import {dispatchSaveFailNotification} from './dispatchSaveFailNotification';
import {handleToxicityRequestError} from './handleToxicityRequestError';

// This is the "core" update logic that is shared when a student saves their
// model customizations (setup, retrieval, and "publish" tab)
export const saveAiCustomization = async (
  currentAiCustomizations: AiCustomizations,
  saveType: SaveType,
  dispatch: AppDispatch,
  levelId: number | null
) => {
  // Notify the UI that a save is in progress.
  dispatch(startSave(saveType));
  Lab2Registry.getInstance()
    .getMetricsReporter()
    .incrementCounter('Aichat.SaveStarted');

  // Wrap toxicity check in try/catch to handle unauthorized usage with a helpful user-facing message.
  let toxicity: DetectToxicityResponse;
  try {
    toxicity = await detectToxicityInCustomizations(
      currentAiCustomizations,
      levelId
    );
  } catch (error) {
    await handleToxicityRequestError(error as Error, dispatch);
    return;
  }

  // If any fields were flagged for toxicity, display a notification and don't try to save.
  if (toxicity.flaggedFields.length > 0) {
    // Log for analysis purposes.
    Lab2Registry.getInstance()
      .getMetricsReporter()
      .logInfo({
        message: 'Toxicity detected in AI customizations',
        flaggedFields: toxicity.flaggedFields,
        customizations: extractFieldsToCheckForToxicity(
          currentAiCustomizations
        ),
      });
    Lab2Registry.getInstance()
      .getMetricsReporter()
      .incrementCounter('Aichat.SaveFailToxicityDetected');
    const errorMessage = getToxicityErrorMessage(toxicity.flaggedFields);
    dispatchSaveFailNotification(
      dispatch as AppDispatch,
      'toxicityError',
      errorMessage
    );
    return;
  }

  await Lab2Registry.getInstance()
    .getProjectManager()
    ?.save({source: JSON.stringify(currentAiCustomizations)}, true);
};

const getToxicityErrorMessage = (flaggedFields: FlaggedField[]) => {
  const fieldLabels = flaggedFields.map(
    flaggedField => AI_CUSTOMIZATIONS_LABELS[flaggedField.field]
  );
  return `The following customization(s) have been flagged by our content moderation policy: ${fieldLabels.join(
    ', '
  )}. Please try a different model customization.`;
};
