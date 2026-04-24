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

import {authReducer, handleAuthFailure} from './authReducer';
import type {AuthOutcome} from './types';

/** React context carrying the current auth outcome. Consume via {@link useAuth}. */
export const AuthContext = createContext<AuthOutcome | null>(null);

/**
 * Provides auth state to all Studio descendants.
 * Fetches `GET /api/v1/users/current` once on mount; exposes a retry closure on failure.
 */
export function AuthProvider({children}: {children: ReactNode}) {
  const [state, dispatch] = useReducer(authReducer, {status: 'loading'});

  /**
   * Stable callback passed to consumers so they can trigger a re-fetch after an error.
   * Stability is required to avoid recreating the context value on every render.
   */
  const handleRetry = useCallback(() => {
    dispatch({type: 'auth/retry'});
  }, []);

  /**
   * Fetches the current user session when state is loading.
   * Re-runs after a retry. Cancellation flag prevents stale dispatch on unmount.
   */
  useEffect(() => {
    if (state.status !== 'loading') return;

    let cancelled = false;

    DashboardApiClient.users
      .getCurrent()
      .then((response: CurrentUserResponse) => {
        if (cancelled) return;
        dispatch({type: 'auth/success', response});
      })
      .catch((err: Error) => {
        if (cancelled) return;
        handleAuthFailure(err, dispatch);
      });

    return () => {
      cancelled = true;
    };
  }, [state.status]);

  /**
   * Merges the retry handler into the error state so consumers receive
   * a complete AuthOutcome with onRetry attached.
   */
  const value: AuthOutcome = useMemo(
    () =>
      state.status === 'error'
        ? {...state, onRetry: handleRetry, eventId: state.eventId}
        : state,
    [state, handleRetry],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Returns the raw context value; null when called outside AuthProvider.
 * Exists to give {@link useAuth} access to the context without a circular import.
 * Prefer {@link useAuth} in components — it validates the context is non-null.
 *
 * @returns The current auth outcome, or null if called outside AuthProvider.
 */
export function useAuthContext(): AuthOutcome | null {
  return useContext(AuthContext);
}
