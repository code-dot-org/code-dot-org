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

export async function getSectionAITutorInteractions(sectionId: number) {
  let data;
  let response;
  try {
    response = await fetch(`/ai_tutor_interactions?sectionId=${sectionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': await getAuthenticityToken(),
      },
    });
    data = await response.json();
  } catch (error) {
    console.log('error fetching ai tutor interactions', error);
  }

  if (response && response.ok) {
    console.log("reponse is ok!")
    return data;
  }
}
