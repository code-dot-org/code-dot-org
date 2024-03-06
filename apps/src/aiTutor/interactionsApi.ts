import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';
import {AITutorInteraction} from './types';
import MetricsReporter from '@cdo/apps/lib/metrics/MetricsReporter';
import {MetricEvent} from '@cdo/apps/lib/metrics/events';

export async function savePromptAndResponse(
  interactionData: AITutorInteraction
) {
  try {
    await fetch('/ai_tutor_interactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': await getAuthenticityToken(),
      },
      body: JSON.stringify(interactionData),
    });
  } catch (error) {
    MetricsReporter.logError({
      event: MetricEvent.AI_TUTOR_CHAT_SAVE_FAIL,
      errorMessage: error,
    });
  }
}

// Fetch student chat messages for a section to display to teachers.
export const fetchChatMessagesForSection = async (sectionId: number) => {
  try {
    const response = await fetch(
      `/ai_tutor_interactions?sectionId=${sectionId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': await getAuthenticityToken(),
        },
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    MetricsReporter.logError({
      event: MetricEvent.AI_TUTOR_CHAT_FETCH_FAIL_FOR_SECTION,
      errorMessage: error,
    });
  }
};

// Fetch student chat messages for one student.
export const fetchChatMessagesForStudent = async (userId: number) => {
  try {
    const response = await fetch(`/ai_tutor_interactions?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': await getAuthenticityToken(),
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    MetricsReporter.logError({
      event: MetricEvent.AI_TUTOR_CHAT_FETCH_FAIL_FOR_STUDENT,
      errorMessage: error,
    });
  }
};
