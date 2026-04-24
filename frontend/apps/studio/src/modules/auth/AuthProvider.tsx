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
import type {CurrentUserResponse} from '@code-dot-org/core/api';
import {logger} from '@code-dot-org/core/plugins/observability';

import {authReducer, handleAuthFailure} from './authReducer';
import type {AuthOutcome} from './types';

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
        dispatch({type: 'success', response});
        logger.info('auth bootstrap: resolved');
      })
      .catch((err: Error) => {
        if (cancelled) return;
        handleAuthFailure(err, dispatch);
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
