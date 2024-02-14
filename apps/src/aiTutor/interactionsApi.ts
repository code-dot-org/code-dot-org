import {getAuthenticityToken} from '../util/AuthenticityTokenStore';
import {AITutorInteraction} from './types';
import MetricsReporter from '@cdo/apps/lib/metrics/MetricsReporter';

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
      event: 'AI Tutor Interaction failed to save.',
      errorMessage: error,
    });
  }
}
