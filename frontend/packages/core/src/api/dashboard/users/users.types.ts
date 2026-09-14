import {z} from 'zod';

import {
  ContactDetailsSchema,
  CurrentPermissionsSchema,
  CurrentUserResponseSchema,
  CurrentUserResponseSignedInSchema,
  CurrentUserResponseSignedOutSchema,
  CurrentUserSchema,
  DonorTeacherBannerDetailsSchema,
  HasDismissedPersonalizationAlertSchema,
  NetsimSignedInSchema,
  PostponeCensusBannerSchema,
  SchoolNameSchema,
  UserSettingsResponseSchema,
} from './users.schemata';

export type CurrentUser = z.infer<typeof CurrentUserSchema>;
export type CurrentUserResponse = z.infer<typeof CurrentUserResponseSchema>;
export type CurrentUserResponseSignedIn = z.infer<
  typeof CurrentUserResponseSignedInSchema
>;
export type CurrentUserResponseSignedOut = z.infer<
  typeof CurrentUserResponseSignedOutSchema
>;
export type NetsimSignedIn = z.infer<typeof NetsimSignedInSchema>;
export type SchoolName = z.infer<typeof SchoolNameSchema>;
export type ContactDetails = z.infer<typeof ContactDetailsSchema>;
export type DonorTeacherBannerDetails = z.infer<
  typeof DonorTeacherBannerDetailsSchema
>;
export type CurrentPermissions = z.infer<typeof CurrentPermissionsSchema>;
export type PostponeCensusBanner = z.infer<typeof PostponeCensusBannerSchema>;
export type HasDismissedPersonalizationAlert = z.infer<
  typeof HasDismissedPersonalizationAlertSchema
>;

// --- My Account settings ---

export type UserSettings = z.infer<typeof UserSettingsResponseSchema>;

export type AuthenticationOptionSummary =
  UserSettings['authenticationOptions'][number];

export type UserType = UserSettings['userType'];

export type EducatorRoleOption = NonNullable<
  UserSettings['educatorRoleOptions']
>[number];

export type SchoolInfoSummary = NonNullable<UserSettings['schoolInfo']>;

export interface UpdateProfileParams {
  givenName?: string;
  familyName?: string;
  displayName?: string;
  username?: string;
  age?: number | string;
  usState?: string;
  gender?: string;
  /** Set or changed only; the role can never be cleared. */
  educatorRole?: string;
}

export interface UpdateSchoolInfoParams {
  schoolId: string;
  country: string;
  schoolName: string;
  schoolZip: string;
}

/** Wire (snake_case) school_info_attributes body. */
export interface SchoolInfoRequest {
  country?: string;
  school_name?: string;
  zip?: string;
  school_type?: string;
  school_id?: string;
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

export interface DeleteUserParams {
  /** Required when the account has a password; omitted for word/picture accounts. */
  password?: string;
}

/** '' means the opt-in question was left unanswered (legacy "update only"). */
export type ParentEmailOptIn = 'yes' | 'no' | '';

export interface UpdateParentEmailParams {
  parentEmail: string;
  optIn: ParentEmailOptIn;
}
