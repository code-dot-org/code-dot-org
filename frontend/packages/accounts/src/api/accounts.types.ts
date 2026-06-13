import type {z} from 'zod';

import type {AccountSettingsResponseSchema} from './accounts.schemata';

/** The Account Details read model, camelCased from the Rails response. */
export type AccountSettings = z.infer<typeof AccountSettingsResponseSchema>;

export type AuthenticationOptionSummary =
  AccountSettings['authenticationOptions'][number];

export type UserType = AccountSettings['userType'];

// Server validation messages keyed by form field (Rails snake_case key).
// Partial so indexed access is `string[] | undefined`, making the `?.` guards
// at every read site load-bearing rather than defensive-by-convention.
export type FieldErrors = Partial<Record<string, string[]>>;

export interface UpdateProfileParams {
  givenName?: string;
  familyName?: string;
  displayName?: string;
  username?: string;
  age?: number | string;
  usState?: string;
}

export interface UpdateEmailParams {
  newEmail: string;
  hashedEmail: string;
  currentPassword: string;
}

export interface UpdatePasswordParams {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirmation: string;
}

export interface UpdateUserTypeParams {
  userType: UserType;
  email?: string;
  hashedEmail?: string;
}

export interface DeleteAccountParams {
  /** Required when the account has a password; omitted for word/picture accounts. */
  password?: string;
}
