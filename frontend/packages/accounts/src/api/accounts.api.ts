import {ApiError, DashboardApiClient} from '@code-dot-org/core/api';
import type {RequestOptions} from '@code-dot-org/core/api';

import {AccountSettingsResponseSchema} from './accounts.schemata';
import type {
  AccountSettings,
  DeleteAccountParams,
  UpdateEmailParams,
  UpdatePasswordParams,
  UpdateProfileParams,
  UpdateUserTypeParams,
} from './accounts.types';
import {AccountsApiValidationError} from './AccountsApiValidationError';

// PATCH endpoints reject with 422, DELETE /users with 400. Accept: application/json
// keeps a signed-out response 401 JSON, not a navigational redirect.
const JSON_ACCEPT = {Accept: 'application/json'} as const;

function isValidationError(error: unknown): error is ApiError {
  return (
    error instanceof ApiError && (error.status === 422 || error.status === 400)
  );
}

async function mutate(req: RequestOptions): Promise<void> {
  try {
    await DashboardApiClient.transport.request<unknown>(req);
  } catch (error) {
    if (isValidationError(error)) {
      throw AccountsApiValidationError.fromApiError(error);
    }
    throw error;
  }
}

export async function getAccountSettings(
  signal?: AbortSignal,
): Promise<AccountSettings> {
  const raw = await DashboardApiClient.transport.request<unknown>({
    method: 'GET',
    url: '/api/v1/account/settings',
    headers: JSON_ACCEPT,
    signal,
  });
  return AccountSettingsResponseSchema.parse(raw);
}

export function updateProfile(params: UpdateProfileParams): Promise<void> {
  return mutate({
    method: 'PATCH',
    url: '/dashboardapi/users',
    headers: JSON_ACCEPT,
    body: {
      user: {
        ...(params.givenName !== undefined && {given_name: params.givenName}),
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
}

export function updatePassword(params: UpdatePasswordParams): Promise<void> {
  return mutate({
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
}

// SSO-only accounts add a first password (no current password to confirm).
export function createPassword(params: {
  newPassword: string;
  newPasswordConfirmation: string;
}): Promise<void> {
  return mutate({
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
}

export function updateEmail(params: UpdateEmailParams): Promise<void> {
  return mutate({
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
}

export function updateUserType(params: UpdateUserTypeParams): Promise<void> {
  return mutate({
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
}

export function deleteAccount(params: DeleteAccountParams): Promise<void> {
  return mutate({
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
}
