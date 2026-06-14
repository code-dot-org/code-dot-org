import type {z} from 'zod';

import type {AccountSettingsResponseSchema} from './account.schemata';

export type AccountSettings = z.infer<typeof AccountSettingsResponseSchema>;

export type AuthenticationOptionSummary =
  AccountSettings['authenticationOptions'][number];

export type UserType = AccountSettings['userType'];

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

export interface CreatePasswordParams {
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

/** '' means the opt-in question was left unanswered (legacy "update only"). */
export type ParentEmailOptIn = 'yes' | 'no' | '';

export interface UpdateParentEmailParams {
  parentEmail: string;
  optIn: ParentEmailOptIn;
}
