import {z} from 'zod';
import camelcaseKeys from 'camelcase-keys';

export const UserTypes = ['student', 'teacher'] as const;

export const SignedInCurrentUserSchema = z
  .object({
    id: z.number(),
    username: z.string(),
    display_name: z.string(),
    user_type: z.enum(UserTypes),
    is_signed_in: z.literal(true),
    short_name: z.string(),
    is_verified_instructor: z.boolean(),
    is_lti: z.boolean(),
    mute_music: z.boolean(),
    under_13: z.boolean(),
    over_21: z.boolean(),
    sort_by_family_name: z.boolean(),
    ai_rubrics_disabled: z.boolean(),
    progress_table_v2_closed_beta: z.boolean(),
    ai_tutor_access_denied: z.boolean(),
    has_seen_progress_table_v2_invitation: z.boolean(),
    has_seen_homepage_welcome: z.boolean(),
    has_dismissed_personalization_alert: z.boolean(),
    date_progress_table_invitation_last_delayed: z.string(),
    child_account_compliance_state: z.string(),
    country_code: z.string(),
    us_state_code: z.string(),
    age: z.number(),
    in_section: z.boolean().nullable(),
    created_at: z.string(),
    has_seen_ai_assessments_announcement: z.boolean(),
    ai_differentiation_enabled: z.boolean(),
    has_completed_ai_differentiation_welcome: z.boolean(),
    educator_role: z.string(),
    sharing_disabled: z.boolean(),
    ai_tutor_enabled_for_pilot: z.boolean(),
  })
  .transform(data => camelcaseKeys(data, {deep: true}));

export const SignedOutCurrentUserSchema = z
  .object({
    is_signed_in: z.literal(false),
  })
  .transform(data => camelcaseKeys(data, {deep: true}));

export const CurrentUserSchema = z.union([
  SignedInCurrentUserSchema,
  SignedOutCurrentUserSchema,
]);

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
