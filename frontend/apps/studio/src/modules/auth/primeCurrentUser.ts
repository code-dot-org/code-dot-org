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
  // Defensive: getCurrent already validated this, but never throw from the root
  // beforeLoad. On an unexpected shape, skip priming and let useCurrentUser
  // refetch (where a parse error surfaces through react-query, not a crash).
  const parsed = CurrentUserSchema.safeParse(auth);
  if (!parsed.success) return;
  queryClient.setQueryData(usersKeys.currentUser(), parsed.data);
}
