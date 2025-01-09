import {MetricEvent} from '@cdo/apps/metrics/events';
import MetricsReporter from '@cdo/apps/metrics/MetricsReporter';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';

import {UserLevelInteraction} from './types';

export async function logUserLevelInteraction(
  interactionData: UserLevelInteraction
) {
  try {
    const response = await fetch('/user_level_interactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': await getAuthenticityToken(),
      },
      body: JSON.stringify(interactionData),
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
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
