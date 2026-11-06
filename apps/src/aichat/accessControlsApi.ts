import {MetricEvent} from '@cdo/apps/metrics/events';
import MetricsReporter from '@cdo/apps/metrics/MetricsReporter';
import HttpClient from '@cdo/apps/util/HttpClient';

import {repackageError} from '../metrics/analyticsUtils';

import {AiChatAccessLevel} from './types';

const updateSectionAiSetting = async (
  sectionId: number,
  setting: 'ai_chat_access_level' | 'ai_challenge_enabled',
  value: AiChatAccessLevel | boolean
) => {
  try {
    await HttpClient.post(
      `/api/v1/sections/${sectionId}/${setting}`,
      JSON.stringify({[setting]: value}),
      true,
      {
        'Content-Type': 'application/json; charset=UTF-8',
      }
    );
  } catch (error) {
    MetricsReporter.logError({
      event: MetricEvent.AI_SETTINGS_UPDATE_SECTION_ACCESS_FAIL,
      errorMessage: repackageError(error),
    });
    // We need to rethrow the error so that the toggle can revert to its original state.
    throw error;
  }
};

export const handleUpdateSectionAiChatAccessLevel = (
  sectionId: number,
  newAccessLevel: AiChatAccessLevel
) => updateSectionAiSetting(sectionId, 'ai_chat_access_level', newAccessLevel);

export const handleUpdateSectionAiChallengeEnabled = (
  sectionId: number,
  enabled: boolean
) => updateSectionAiSetting(sectionId, 'ai_challenge_enabled', enabled);
