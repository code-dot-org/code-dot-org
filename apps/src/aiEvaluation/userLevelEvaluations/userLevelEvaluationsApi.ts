import {MetricEvent} from '@cdo/apps/metrics/events';
import MetricsReporter from '@cdo/apps/metrics/MetricsReporter';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';

import {UserLevelEvaluation} from './types';

export async function logUserLevelEvaluation(
  evaluationData: UserLevelEvaluation
) {
  try {
    const response = await fetch('/user_level_evaluations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': await getAuthenticityToken(),
      },
      body: JSON.stringify(evaluationData),
    });
    if (!response.ok) {
      throw new Error('Failed to save UserLevel evaluation');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    MetricsReporter.logError({
      event: MetricEvent.USER_LEVEL_INTERACTION_SAVE_FAIL,
      errorMessage:
        (error as Error).message || 'Failed to save UserLevel evaluation',
    });
  }
}
