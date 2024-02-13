import Lab2Registry from '../lab2/Lab2Registry';
import {getAuthenticityToken} from '../util/AuthenticityTokenStore';
import {AITutorInteraction} from './types';

export async function savePromptAndResponse(interactionData: AITutorInteraction) {
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
    Lab2Registry.getInstance()
      .getMetricsReporter()
      .logError('AI Tutor Interaction failed to save.', error as Error);
  }
}
