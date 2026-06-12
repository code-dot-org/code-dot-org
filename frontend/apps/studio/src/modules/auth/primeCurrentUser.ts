import {
  CurrentUserSchema,
  usersKeys,
  type QueryClient,
} from '@code-dot-org/core/api';

import type {AuthOutcome} from './types';

/**
 * Primes the shared current-user query cache from a resolved auth outcome, so a
 * feature module reading via `useCurrentUser` does not issue a second
 * `/api/v1/users/current` request (design D4). The auth bootstrap already
 * fetched the snake_case response; re-parse it into the camelCase shape the
 * hook expects. `CurrentUserSchema` strips the extra `status` discriminant.
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
