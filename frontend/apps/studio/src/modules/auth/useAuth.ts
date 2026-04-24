import {useAuthContext} from './AuthProvider';
import type {AuthOutcome} from './types';

/** Returns the current auth outcome. Must be called inside {@link AuthProvider}. */
export function useAuth(): AuthOutcome {
  const ctx = useAuthContext();
  if (ctx === null) {
    throw new Error('useAuth must be called inside <AuthProvider>');
  }
  return ctx;
}
