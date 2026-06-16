import {getRouteApi} from '@tanstack/react-router';

import type {AuthOutcome} from './types';

/**
 * Route API handle for `__root__`.
 * Using `getRouteApi` instead of importing `Route` from `routes/__root.tsx`
 * avoids a circular module dependency.
 */
const rootRouteApi = getRouteApi('__root__');

/**
 * Returns the current auth outcome from the root route context.
 * Must be called inside a component rendered under the root route.
 *
 * @returns The resolved auth outcome — never `loading`.
 */
export function useAuth(): AuthOutcome {
  return rootRouteApi.useRouteContext().auth;
}
