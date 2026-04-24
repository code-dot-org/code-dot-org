import type {Dispatch} from 'react';
import {ZodError} from 'zod';

import type {
  CurrentUserResponse,
  CurrentUserResponseSignedIn,
} from '@code-dot-org/core/api';
import {recordError, logger} from '@code-dot-org/core/plugins/observability';

/** All possible states of the auth bootstrap lifecycle. */
export type ReducerState =
  | {status: 'loading'}
  | ({status: 'signed-in'} & CurrentUserResponseSignedIn)
  | {status: 'signed-out'}
  | {status: 'error'; eventId?: string};

/** Discriminated union of all actions the auth reducer handles. */
export type AuthAction =
  | {type: 'success'; response: CurrentUserResponse}
  | {type: 'failure'; tag: string; eventId?: string}
  | {type: 'retry'};

/**
 * Pure reducer for auth bootstrap state transitions.
 * Ignores actions that arrive in an unexpected state (idempotent).
 *
 * @param state - Current auth state.
 * @param action - Action to apply.
 * @returns Next auth state.
 */
export function authReducer(
  state: ReducerState,
  action: AuthAction,
): ReducerState {
  switch (action.type) {
    case 'success': {
      if (state.status !== 'loading') return state;
      if (action.response.is_signed_in) {
        return {status: 'signed-in', ...action.response};
      }
      return {status: 'signed-out'};
    }
    case 'failure':
      if (state.status !== 'loading') return state;
      return {status: 'error', eventId: action.eventId};
    case 'retry':
      if (state.status !== 'error') return state;
      return {status: 'loading'};
    default: {
      const _: never = action;
      throw new Error(`Unhandled auth action: ${JSON.stringify(_)}`);
    }
  }
}

/**
 * Classifies a fetch error into a loggable tag string.
 *
 * @param err - The error to classify.
 * @returns A tag string identifying the error category: `http_<status>`, `parse_error`, or `network_error`.
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
 * Records an auth bootstrap failure via the observability plugin,
 * logs it, and dispatches the failure action.
 *
 * @param err - The error thrown by the fetch.
 * @param dispatch - React dispatch function from useReducer.
 */
export function handleAuthFailure(
  err: Error,
  dispatch: Dispatch<AuthAction>,
): void {
  const tag = classifyError(err);
  const eventId = recordError(err, {error_kind: tag});
  logger.error('auth bootstrap: terminal failure', {
    error_kind: tag,
    event_id: eventId,
  });
  dispatch({type: 'failure', tag, eventId});
}
