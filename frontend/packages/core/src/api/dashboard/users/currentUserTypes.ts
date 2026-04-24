import {z} from 'zod';

export const CurrentUserResponseSignedOutSchema = z.object({
  is_signed_in: z.literal(false),
});

export const CurrentUserResponseSignedInSchema = z.object({
  is_signed_in: z.literal(true),

  // Identity
  id: z.number(),
  username: z.string(),
  display_name: z.string(),
  short_name: z.string(),
  user_type: z.enum(['student', 'teacher', 'admin']),

  // Personalization / role signals
  is_verified_instructor: z.boolean(),
  is_levelbuilder: z.boolean(),
  educator_role: z.string().nullable(),
  grades_teaching: z.array(z.string()),

  // Privacy / compliance signals
  under_13: z.boolean(),
  over_21: z.boolean(),
  age: z.union([z.string(), z.number()]).nullable(),
  country_code: z.string().nullable(),
  us_state_code: z.string().nullable(),
  child_account_compliance_state: z.string().nullable(),
  sharing_disabled: z.boolean().nullable(),

  // Preferences
  mute_music: z.boolean(),
  sort_by_family_name: z.boolean(),
  has_seen_homepage_welcome: z.boolean(),
  has_dismissed_personalization_alert: z.boolean(),

  // AI gating
  ai_chat_access_level: z.union([z.string(), z.number()]),
  ai_tutor_access_denied: z.boolean(),
  ai_rubrics_disabled: z.boolean().nullable(),
  ai_differentiation_enabled: z.boolean(),
  has_seen_ai_assessments_announcement: z.boolean(),
  has_completed_ai_differentiation_welcome: z.boolean(),

  // Session context
  is_lti: z.boolean(),
  in_section: z.number().nullable(),
  created_at: z.string(),
});

export const CurrentUserResponseSchema = z.discriminatedUnion('is_signed_in', [
  CurrentUserResponseSignedOutSchema,
  CurrentUserResponseSignedInSchema,
]);

export type CurrentUserResponseSignedOut = z.infer<
  typeof CurrentUserResponseSignedOutSchema
>;
export type CurrentUserResponseSignedIn = z.infer<
  typeof CurrentUserResponseSignedInSchema
>;
export type CurrentUserResponse = z.infer<typeof CurrentUserResponseSchema>;
