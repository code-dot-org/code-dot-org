import {ZodError} from 'zod';

import {DashboardApiClient} from '@code-dot-org/core/api';
import {recordError, logger} from '@code-dot-org/core/plugins/observability';

import type {AuthOutcome} from './types';

/**
 * Classifies a fetch error into a loggable tag string.
 *
 * @param err - The error to classify.
 * @returns `http_<status>`, `parse_error`, or `network_error`.
 */
function classifyError(err: Error): string {
  if (
    'response' in err &&
    (err as {response: unknown}).response instanceof Response
  ) {
    return `http_${(err as {response: Response}).response.status}`;
  }
  if (err instanceof ZodError || err instanceof SyntaxError) {
    return 'parse_error';
  }
  return 'network_error';
}

/**
 * Fetches `GET /api/v1/users/current` and maps the result to an {@link AuthOutcome}.
 * Never rejects — network and parse failures are caught and returned as `error` status.
 * Called from the root route's `beforeLoad` so auth is resolved before any render.
 *
 * @returns The resolved auth outcome.
 */
export async function fetchAuthOutcome(): Promise<AuthOutcome> {
  try {
    const response = await DashboardApiClient.users.getCurrent();
    return response.is_signed_in
      ? {status: 'signed-in', ...response}
      : {status: 'signed-out'};
  } catch (err) {
    const error = err as Error;
    const tag = classifyError(error);
    const observabilityEventId = recordError(error, {error_kind: tag});
    logger.error('auth bootstrap: terminal failure', {
      error_kind: tag,
      event_id: observabilityEventId,
    });
    return {status: 'error', observabilityEventId};
  }
}
