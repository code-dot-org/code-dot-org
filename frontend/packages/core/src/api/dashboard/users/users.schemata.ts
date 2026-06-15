import camelcaseKeys from 'camelcase-keys';
import {z} from 'zod';

import {CurrentUserResponseSchema} from './currentUserTypes';

// Derived from the canonical currentUserTypes schema, not re-declared: a
// hand-copied duplicate previously diverged from the endpoint.
export const CurrentUserSchema = CurrentUserResponseSchema.transform(data =>
  camelcaseKeys(data, {deep: true}),
);

export const SignedInResponseSchema = z.object({
  is_signed_in: z.boolean(),
});

export const NetsimSignedInSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    is_admin: z.boolean(),
    is_signed_in: z.literal(true),
    owned_sections: z.array(z.number()),
  })
  .transform(data => camelcaseKeys(data, {deep: true}));

export const SchoolNameSchema = z
  .object({
    school_name: z.string().nullable(),
  })
  .transform(data => camelcaseKeys(data, {deep: true}));

export const ContactDetailsSchema = z
  .object({
    user_name: z.string().nullable(),
    email: z.string().nullable(),
    zip: z.string().nullable(),
  })
  .transform(data => camelcaseKeys(data, {deep: true}));

export const DonorTeacherBannerDetailsTeacherSchema = z
  .object({
    user_type: z.literal('teacher'),
    teacher_first_name: z.string().nullable(),
    teacher_second_name: z.string().nullable(),
    teacher_email: z.string().nullable(),
    nces_school_id: z.string().nullable(),
    school_name: z.string().nullable(),
    school_address_1: z.string().nullable(),
    school_address_2: z.string().nullable(),
    school_address_3: z.string().nullable(),
    school_city: z.string().nullable(),
    school_state: z.string().nullable(),
    school_zip: z.string().nullable(),
    afe_high_needs: z.boolean().nullable(),
  })
  .transform(data => camelcaseKeys(data, {deep: true}));

export const DonorTeacherBannerDetailsStudentSchema = z
  .object({
    user_type: z.literal('student'),
  })
  .transform(data => camelcaseKeys(data, {deep: true}));

export const DonorTeacherBannerDetailsSchema = z.union([
  DonorTeacherBannerDetailsTeacherSchema,
  DonorTeacherBannerDetailsStudentSchema,
]);

export const CurrentPermissionsSchema = z.object({
  permissions: z.array(z.string()),
});

export const PostponeCensusBannerSchema = z
  .object({
    next_census_display: z.string(),
  })
  .transform(data => camelcaseKeys(data, {deep: true}));

export const HasDismissedPersonalizationAlertSchema = z
  .object({
    has_dismissed_personalization_alert: z.boolean(),
  })
  .transform(data => camelcaseKeys(data, {deep: true}));

// --- My Account settings (GET /api/v1/users/me/settings) ---

const AuthenticationOptionSchema = z.object({
  credential_type: z.string(),
  email: z.string().nullable(),
});

// Age / US-state dropdown choices, served from the Rails source of truth
// (User::AGE_DROPDOWN_OPTIONS, User.us_state_dropdown_options) so the client
// doesn't duplicate them.
const DropdownOptionSchema = z.object({value: z.string(), text: z.string()});

// Wire (snake_case) shape of GET /api/v1/users/me/settings, transformed to the
// camelCase model the page consumes.
export const UserSettingsResponseSchema = z
  .object({
    user_type: z.enum(['student', 'teacher']),
    given_name: z.string().nullable(),
    family_name: z.string().nullable(),
    display_name: z.string(),
    username: z.string().nullable(),
    email: z.string().nullable(),
    has_password: z.boolean(),
    can_edit_email: z.boolean(),
    can_edit_password: z.boolean(),
    should_see_add_password_form: z.boolean(),
    should_see_edit_email_link: z.boolean(),
    authentication_options: z.array(AuthenticationOptionSchema),
    can_change_user_type: z.boolean(),
    can_delete_own_account: z.boolean(),
    // Nullable on read (a student may have neither yet); the server requires
    // them for students on save, and a blank save surfaces the server's error.
    age: z.union([z.number(), z.string()]).nullable(),
    us_state: z.string().nullable(),
    parent_email: z.string().nullable(),
    dependent_students_count: z.number(),
    age_options: z.array(DropdownOptionSchema),
    us_state_options: z.array(DropdownOptionSchema),
  })
  .transform(r => ({
    userType: r.user_type,
    givenName: r.given_name,
    familyName: r.family_name,
    displayName: r.display_name,
    username: r.username,
    email: r.email,
    hasPassword: r.has_password,
    canEditEmail: r.can_edit_email,
    canEditPassword: r.can_edit_password,
    shouldSeeAddPasswordForm: r.should_see_add_password_form,
    shouldSeeEditEmailLink: r.should_see_edit_email_link,
    authenticationOptions: r.authentication_options.map(option => ({
      credentialType: option.credential_type,
      email: option.email,
    })),
    canChangeUserType: r.can_change_user_type,
    canDeleteOwnAccount: r.can_delete_own_account,
    age: r.age,
    usState: r.us_state,
    parentEmail: r.parent_email,
    dependentStudentsCount: r.dependent_students_count,
    ageOptions: r.age_options,
    usStateOptions: r.us_state_options,
  }));
