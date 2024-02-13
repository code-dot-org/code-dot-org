import MetricsReporter from '../lib/metrics/MetricsReporter';
import {getAuthenticityToken} from '../util/AuthenticityTokenStore';
import {AITutorInteraction} from './types';

export async function savePromptAndResponse(interactionData: AITutorInteraction) {
  try {
    let response = await fetch('/ai_tutor_interactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': await getAuthenticityToken(),
      },
      body: JSON.stringify(interactionData),
    });
    let data = await response.json();
    console.log('data', data);
  } catch (error) {
    MetricsReporter.logError({
      event: 'AI Tutor interaction failed to save.',
      error: error,
    });
  }
}
