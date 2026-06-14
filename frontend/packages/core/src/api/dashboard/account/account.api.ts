import {refreshCsrfToken, resolveCsrfToken} from '../../csrfToken';
import type {Transport} from '../../transports/types';

import {AccountSettingsResponseSchema} from './account.schemata';
import type {
  AccountSettings,
  CreatePasswordParams,
  DeleteAccountParams,
  UpdateEmailParams,
  UpdateParentEmailParams,
  UpdatePasswordParams,
  UpdateProfileParams,
  UpdateUserTypeParams,
} from './account.types';

// Accept: application/json keeps a signed-out response a 401 JSON, not a
// navigational redirect. Mutations reject with an ApiError (422/400) the caller
// maps to field/form messages.
const JSON_ACCEPT = {Accept: 'application/json'} as const;
const PARENT_EMAIL_CHANGE = 'PARENT_EMAIL_CHANGE';

export function createAccountApi(transport: Transport) {
  return {
    /** GET /api/v1/account/settings */
    async getSettings(signal?: AbortSignal): Promise<AccountSettings> {
      const raw = await transport.request<unknown>({
        method: 'GET',
        url: '/api/v1/account/settings',
        headers: JSON_ACCEPT,
        signal,
      });
      return AccountSettingsResponseSchema.parse(raw);
    },

    /** PATCH /dashboardapi/users */
    updateProfile(params: UpdateProfileParams): Promise<unknown> {
      return transport.request<unknown>({
        method: 'PATCH',
        url: '/dashboardapi/users',
        headers: JSON_ACCEPT,
        body: {
          user: {
            ...(params.givenName !== undefined && {
              given_name: params.givenName,
            }),
            ...(params.familyName !== undefined && {
              family_name: params.familyName,
            }),
            ...(params.displayName !== undefined && {name: params.displayName}),
            ...(params.username !== undefined && {username: params.username}),
            ...(params.age !== undefined && {age: params.age}),
            ...(params.usState !== undefined && {us_state: params.usState}),
          },
        },
      });
    },

    /** PATCH /dashboardapi/users */
    updatePassword(params: UpdatePasswordParams): Promise<unknown> {
      return transport.request<unknown>({
        method: 'PATCH',
        url: '/dashboardapi/users',
        headers: JSON_ACCEPT,
        body: {
          user: {
            current_password: params.currentPassword,
            password: params.newPassword,
            password_confirmation: params.newPasswordConfirmation,
          },
        },
      });
    },

    /** PATCH /dashboardapi/users — SSO-only accounts add a first password. */
    createPassword(params: CreatePasswordParams): Promise<unknown> {
      return transport.request<unknown>({
        method: 'PATCH',
        url: '/dashboardapi/users',
        headers: JSON_ACCEPT,
        body: {
          user: {
            password: params.newPassword,
            password_confirmation: params.newPasswordConfirmation,
          },
        },
      });
    },

    /** PATCH /users/email */
    updateEmail(params: UpdateEmailParams): Promise<unknown> {
      return transport.request<unknown>({
        method: 'PATCH',
        url: '/users/email',
        headers: JSON_ACCEPT,
        body: {
          user: {
            email: params.newEmail,
            hashed_email: params.hashedEmail,
            current_password: params.currentPassword,
          },
        },
      });
    },

    /** PATCH /users/user_type */
    updateUserType(params: UpdateUserTypeParams): Promise<unknown> {
      return transport.request<unknown>({
        method: 'PATCH',
        url: '/users/user_type',
        headers: JSON_ACCEPT,
        body: {
          user: {
            user_type: params.userType,
            ...(params.email !== undefined && {email: params.email}),
            ...(params.hashedEmail !== undefined && {
              hashed_email: params.hashedEmail,
            }),
          },
        },
      });
    },

    /** PATCH /users/parent_email — add/update a student's parent/guardian email. */
    updateParentEmail(params: UpdateParentEmailParams): Promise<unknown> {
      return transport.request<unknown>({
        method: 'PATCH',
        url: '/users/parent_email',
        headers: JSON_ACCEPT,
        body: {
          user: {
            parent_email: params.parentEmail,
            parent_email_preference_opt_in: params.optIn,
            parent_email_preference_source: PARENT_EMAIL_CHANGE,
          },
        },
      });
    },

    // PATCH /users — clears the parent_email column. The dedicated
    // /users/parent_email endpoint always fires the "email added" mailer, so
    // removal goes through the registration update instead.
    removeParentEmail(): Promise<unknown> {
      return transport.request<unknown>({
        method: 'PATCH',
        url: '/users',
        headers: JSON_ACCEPT,
        body: {user: {parent_email: ''}},
      });
    },

    // DELETE /expire_other signs the user out of every OTHER browser/device,
    // then re-issues this session and 302s to the account page. We must NOT
    // follow that redirect: a redirected DELETE re-fires as DELETE /users/edit
    // and 404s. With redirect:'manual' the action still runs server-side (the
    // rotated session cookie is applied from the 302 response); the
    // opaqueredirect — or a 204 from the mock — is success. Bypasses the
    // transport because ky always follows redirects and throws on the result.
    async signOutOtherSessions(): Promise<void> {
      const response = await fetch('/expire_other', {
        method: 'DELETE',
        credentials: 'same-origin',
        redirect: 'manual',
        headers: {...JSON_ACCEPT, 'X-CSRF-Token': resolveCsrfToken() ?? ''},
      });
      if (response.type !== 'opaqueredirect' && !response.ok) {
        throw new Error(`Sign-out request failed: ${response.status}`);
      }
      // expire_other drops _csrf_token before re-signing-in, so the session
      // token rotates; refresh ours or the next mutation 422s on a stale token.
      await refreshCsrfToken();
    },

    /** DELETE /users */
    deleteAccount(params: DeleteAccountParams): Promise<unknown> {
      return transport.request<unknown>({
        method: 'DELETE',
        url: '/users',
        headers: JSON_ACCEPT,
        // DELETE reads a top-level password_confirmation, not a nested user[...].
        // Word/picture accounts send none.
        body:
          params.password !== undefined
            ? {password_confirmation: params.password}
            : undefined,
      });
    },
  };
}
