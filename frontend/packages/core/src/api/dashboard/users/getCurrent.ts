import type {KyInstance} from 'ky';

import type {CurrentUserResponse} from './currentUserTypes';

/**
 * Factory for `GET /api/v1/users/current`.
 * Resolves to the current session snapshot; rejects on non-2xx, network error, or malformed JSON.
 */
export const getCurrent =
  (http: KyInstance) => (): Promise<CurrentUserResponse> => {
    return http.get('api/v1/users/current').json<CurrentUserResponse>();
  };
