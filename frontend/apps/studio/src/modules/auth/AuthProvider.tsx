import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import type {ReactNode} from 'react';

import {DashboardApiClient} from '@code-dot-org/core/api';
import type {
  CurrentUserResponse,
  CurrentUserResponseSignedIn,
} from '@code-dot-org/core/api';
import {recordError, logger} from '@code-dot-org/core/plugins/observability';

import type {AuthOutcome} from './types';

type ReducerState =
  | {status: 'loading'}
  | ({status: 'signed-in'} & CurrentUserResponseSignedIn)
  | {status: 'signed-out'}
  | {status: 'error'; eventId?: string};

type AuthAction =
  | {type: 'success'; response: CurrentUserResponse}
  | {type: 'failure'; tag: string; eventId?: string}
  | {type: 'retry'};

function authReducer(state: ReducerState, action: AuthAction): ReducerState {
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

export const AuthContext = createContext<AuthOutcome | null>(null);

/**
 * Provides auth state to all Studio descendants.
 * Fetches `GET /api/v1/users/current` once on mount; exposes a retry closure on failure.
 */
export function AuthProvider({children}: {children: ReactNode}) {
  const [state, dispatch] = useReducer(authReducer, {status: 'loading'});

  const handleRetry = useCallback(() => {
    dispatch({type: 'retry'});
  }, []);

  useEffect(() => {
    if (state.status !== 'loading') return;

    let cancelled = false;

    DashboardApiClient.users
      .getCurrent()
      .then((response: CurrentUserResponse) => {
        if (cancelled) return;
        if (
          !('is_signed_in' in response) ||
          typeof response.is_signed_in !== 'boolean'
        ) {
          const eventId = recordError(
            new Error('auth bootstrap: malformed response'),
            {error_kind: 'parse_error'},
          );
          logger.error('auth bootstrap: malformed response', {
            error_kind: 'parse_error',
            event_id: eventId,
          });
          dispatch({type: 'failure', tag: 'parse_error', eventId});
          return;
        }
        dispatch({type: 'success', response});
        logger.info('auth bootstrap: resolved');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        let tag: string;
        if (
          err !== null &&
          typeof err === 'object' &&
          'response' in err &&
          (err as {response: unknown}).response instanceof Response
        ) {
          tag = `http_${(err as {response: Response}).response.status}`;
        } else if (err instanceof SyntaxError) {
          tag = 'parse_error';
        } else {
          tag = 'network_error';
        }
        const eventId = recordError(err, {error_kind: tag});
        logger.error('auth bootstrap: terminal failure', {
          error_kind: tag,
          event_id: eventId,
        });
        dispatch({type: 'failure', tag, eventId});
      });

    return () => {
      cancelled = true;
    };
  }, [state.status]);

  const value: AuthOutcome = useMemo(
    () =>
      state.status === 'error'
        ? {...state, onRetry: handleRetry, eventId: state.eventId}
        : state,
    [state, handleRetry],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** @internal */
export function useAuthContext(): AuthOutcome | null {
  return useContext(AuthContext);
}
