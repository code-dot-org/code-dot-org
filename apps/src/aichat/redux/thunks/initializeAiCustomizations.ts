import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {getTypedKeys} from '@cdo/apps/types/utils';
import {AppDispatch} from '@cdo/apps/util/reduxHooks';

import {AiCustomizations, LevelAichatSettings, Visibility} from '../../types';
import {
  DEFAULT_VISIBILITIES,
  EMPTY_AI_CUSTOMIZATIONS,
} from '../../views/modelCustomization/constants';
import {validateModelId} from '../../views/modelCustomization/utils';
import {setInitialConfiguration} from '../slice';

import {sendAnalytics} from './sendAnalytics';

/**
 * Initialize AI customizations for the level by reconciling student customizations
 * with level settings.
 */
export const initializeAiCustomizations =
  (
    studentAiCustomizations: AiCustomizations,
    levelAichatSettings?: LevelAichatSettings
  ) =>
  (dispatch: AppDispatch) => {
    const visibilities =
      levelAichatSettings?.visibilities || DEFAULT_VISIBILITIES;

    let reconciledAiCustomizations: AiCustomizations = {
      ...(levelAichatSettings?.initialCustomizations ||
        EMPTY_AI_CUSTOMIZATIONS),
    };

    for (const customization of getTypedKeys(reconciledAiCustomizations)) {
      if (
        visibilities[customization] === Visibility.EDITABLE &&
        studentAiCustomizations[customization]
      ) {
        reconciledAiCustomizations = {
          ...reconciledAiCustomizations,
          [customization]: studentAiCustomizations[customization],
        };
      }
    }

    const {isValid, modelId: correctedModelId} = validateModelId(
      reconciledAiCustomizations.selectedModelId,
      levelAichatSettings?.availableModelIds
    );

    if (!isValid) {
      dispatch(
        sendAnalytics(EVENTS.AICHAT_UNSUPPORTED_MODEL_SELECTED, {
          previousModelId: reconciledAiCustomizations.selectedModelId,
          correctedModelId,
        })
      );
    }

    reconciledAiCustomizations = {
      ...reconciledAiCustomizations,
      selectedModelId: correctedModelId,
    };

    dispatch(
      setInitialConfiguration({
        customizations: reconciledAiCustomizations,
        visibilities,
        showUnsupportedModelMessage: !isValid,
      })
    );
  };
