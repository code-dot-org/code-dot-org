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
