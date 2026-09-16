import {http, HttpResponse} from 'msw';

import type {CurrentUserResponse} from '../dashboard/users/users.types';

/**
 * Default `/api/v1/users/current` response: signed-out. Studio's auth bootstrap
 * (`fetchAuthOutcome`, run in the root route's `beforeLoad`) hits this on every
 * route, so without a handler the request falls through to the real network
 * (worker is `onUnhandledRequest: 'warn'`) and auth resolves to `error`. A
 * signed-out response lets the app render the route in mock mode.
 *
 * A scenario can override this by registering a wildcard `users/current` route
 * through `registerMockFixture` (served ahead of this default by the
 * dispatcher) when a signed-in user is needed.
 */
function currentUserPayload(): CurrentUserResponse {
  return {is_signed_in: false};
}

export const usersHandlers = [
  http.get('*/api/v1/users/current', () =>
    HttpResponse.json(currentUserPayload()),
  ),
];
