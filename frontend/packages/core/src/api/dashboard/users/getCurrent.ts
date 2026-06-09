import type {KyInstance} from 'ky';

import {CurrentUserResponseSchema} from './currentUserTypes';
import type {CurrentUserResponse} from './currentUserTypes';

/**
 * Factory for `GET /api/v1/users/current`.
 * Resolves to the current session snapshot; rejects on non-2xx, network error, or malformed JSON.
 * Throws ZodError if the response shape does not match the schema.
 *
 * @param http - Configured ky instance with base URL and auth headers.
 * @returns A bound function that fetches and validates the current user.
 */
export const getCurrent =
  (http: KyInstance) => async (): Promise<CurrentUserResponse> => {
    const raw = await http.get('api/v1/users/current').json<unknown>();
    return CurrentUserResponseSchema.parse(raw);
  };
