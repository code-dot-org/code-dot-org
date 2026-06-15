import {refreshCsrfToken} from '../../csrfToken';
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
    async updateProfile(params: UpdateProfileParams): Promise<void> {
      await transport.request<unknown>({
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
    async updatePassword(params: UpdatePasswordParams): Promise<void> {
      await transport.request<unknown>({
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
    async createPassword(params: CreatePasswordParams): Promise<void> {
      await transport.request<unknown>({
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
    async updateEmail(params: UpdateEmailParams): Promise<void> {
      await transport.request<unknown>({
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
    async updateUserType(params: UpdateUserTypeParams): Promise<void> {
      await transport.request<unknown>({
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
    async updateParentEmail(params: UpdateParentEmailParams): Promise<void> {
      await transport.request<unknown>({
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
    async removeParentEmail(): Promise<void> {
      await transport.request<unknown>({
        method: 'PATCH',
        url: '/users',
        headers: JSON_ACCEPT,
        body: {user: {parent_email: ''}},
      });
    },

    // DELETE /expire_other signs out every OTHER session, then re-signs this one
    // and 302s. redirect:'manual' stops the transport following it (a followed
    // DELETE would re-fire at the target and 404); the action still runs.
    async signOutOtherSessions(): Promise<void> {
      await transport.requestWithMeta({
        method: 'DELETE',
        url: '/expire_other',
        redirect: 'manual',
        headers: JSON_ACCEPT,
      });
      // expire_other rotates the session token; refresh ours or the next
      // mutation 422s on a stale token.
      await refreshCsrfToken(transport);
    },

    /** DELETE /users */
    async deleteAccount(params: DeleteAccountParams): Promise<void> {
      await transport.request<unknown>({
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
