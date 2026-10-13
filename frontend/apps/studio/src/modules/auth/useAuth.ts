import {getRouteApi} from '@tanstack/react-router';

import type {AuthOutcome} from './types';

/**
 * Route API handle for `/_studio`.
 * Using `getRouteApi` instead of importing `Route` from `routes/_studio.tsx`
 * avoids a circular module dependency.
 */
const studioRouteApi = getRouteApi('/_studio');

/**
 * Returns the current auth outcome from the Studio layout route context.
 * Must be called inside a component rendered under the Studio layout route.
 *
 * @returns The resolved auth outcome — never `loading`.
 */
export function useAuth(): AuthOutcome {
  return studioRouteApi.useRouteContext().auth;
}
