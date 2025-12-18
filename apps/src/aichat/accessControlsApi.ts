import {MetricEvent} from '@cdo/apps/metrics/events';
import MetricsReporter from '@cdo/apps/metrics/MetricsReporter';
// import HttpClient from '@cdo/apps/util/HttpClient';

import {repackageError} from '../metrics/analyticsUtils';

import {AiChatAccessLevel} from './types';

export const handleUpdateSectionAiChatAccessLevel = async (
  sectionId: number,
  newAccessLevel: AiChatAccessLevel
) => {
  try {
    // TODO-AICHAT-PERMISSIONS: uncomment when ai_chat_access_level endpoint implemented.
    // await HttpClient.post(
    //   `/api/v1/sections/${sectionId}/ai_chat_access_level`,
    //   JSON.stringify({ai_chat_access_level: newAccessLevel}),
    //   true,
    //   {
    //     'Content-Type': 'application/json; charset=UTF-8',
    //   }
    // );
  } catch (error) {
    MetricsReporter.logError({
      event: MetricEvent.AI_SETTINGS_UPDATE_SECTION_ACCESS_FAIL,
      errorMessage: repackageError(error),
    });
    // We need to rethrow the error so that the toggle can revert to its original state.
    throw error;
  }
};
