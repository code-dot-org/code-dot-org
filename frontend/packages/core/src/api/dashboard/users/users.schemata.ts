import camelcaseKeys from 'camelcase-keys';
import {z} from 'zod';

import {CurrentUserResponseSchema} from './currentUserTypes';

// Derived (not re-declared) from the canonical currentUserTypes schema; a prior
// hand-copied duplicate silently diverged from the endpoint. Discriminate on
// is_signed_in (a targeted error on a bad field, not an opaque union failure)
// before camelCasing.
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
