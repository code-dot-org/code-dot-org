import {MetricEvent} from '@cdo/apps/metrics/events';
import MetricsReporter from '@cdo/apps/metrics/MetricsReporter';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';

import {UserLevelInteraction} from './types';

export async function logUserLevelInteraction(
  interactionData: UserLevelInteraction
) {
  if (interactionData && interactionData.scriptId) {
    try {
      const response = await fetch('/user_level_interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': await getAuthenticityToken(),
        },
        body: JSON.stringify(interactionData),
      });
      if (response.status === 400) {
        console.log('Bad request: likely the script is not 2024+');
      } else if (!response.ok) {
        throw new Error('Failed to save User Level interaction');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      MetricsReporter.logError({
        event: MetricEvent.USER_LEVEL_INTERACTION_SAVE_FAIL,
        errorMessage:
          (error as Error).message || 'Failed to save User Level interaction',
      });
    }
  }
}
