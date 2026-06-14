import {
  CurrentUserSchema,
  usersKeys,
  type QueryClient,
} from '@code-dot-org/core/api';

import type {AuthOutcome} from './types';

/**
 * Primes the shared current-user cache from the resolved auth outcome so feature
 * modules read it via `useCurrentUser` instead of re-fetching. Re-parses the
 * bootstrap's snake_case response into camelCase; the schema drops the `status`
 * discriminant.
 */
export function primeCurrentUser(
  queryClient: QueryClient,
  auth: AuthOutcome,
): void {
  if (auth.status !== 'signed-in') return;
  queryClient.setQueryData(
    usersKeys.currentUser(),
    CurrentUserSchema.parse(auth),
  );
}
