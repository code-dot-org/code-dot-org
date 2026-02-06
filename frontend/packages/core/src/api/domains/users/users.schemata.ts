import {z} from 'zod';

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
  .transform(data => ({
    ...data,
    displayName: data.display_name,
    userType: data.user_type,
    shortName: data.short_name,
    isVerifiedInstructor: data.is_verified_instructor,
    isLti: data.is_lti,
    muteMusic: data.mute_music,
    under13: data.under_13,
    over21: data.over_21,
    sortByFamilyName: data.sort_by_family_name,
    aiRubricsDisabled: data.ai_rubrics_disabled,
    progressTableV2ClosedBeta: data.progress_table_v2_closed_beta,
    aiTutorAccessDenied: data.ai_tutor_access_denied,
    hasSeenProgressTableV2Invitation:
      data.has_seen_progress_table_v2_invitation,
    hasSeenHomepageWelcome: data.has_seen_homepage_welcome,
    hasDismissedPersonalizationAlert: data.has_dismissed_personalization_alert,
    dateProgressTableInvitationLastDelayed:
      data.date_progress_table_invitation_last_delayed,
    childAccountComplianceState: data.child_account_compliance_state,
    countryCode: data.country_code,
    usStateCode: data.us_state_code,
    age: data.age,
    inSection: data.in_section,
    createdAt: data.created_at,
    hasSeenAiAssessmentsAnnouncement: data.has_seen_ai_assessments_announcement,
    aiDifferentiationEnabled: data.ai_differentiation_enabled,
    hasCompletedAiDifferentiationWelcome:
      data.has_completed_ai_differentiation_welcome,
    educatorRole: data.educator_role,
    sharingDisabled: data.sharing_disabled,
    aiTutorEnabledForPilot: data.ai_tutor_enabled_for_pilot,
  }));

export const SignedOutCurrentUserSchema = z.object({
  is_signed_in: z.literal(false),
});

export const CurrentUserSchema = z
  .union([SignedInCurrentUserSchema, SignedOutCurrentUserSchema])
  .transform(data => ({
    ...data,
    isSignedIn: data.is_signed_in,
  }));

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
  .transform(data => ({
    ...data,
    isAdmin: data.is_admin,
    isSignedIn: data.is_signed_in,
    ownedSections: data.owned_sections,
  }));

export const SchoolNameSchema = z
  .object({
    school_name: z.string().nullable(),
  })
  .transform(data => ({
    schoolName: data.school_name,
  }));

export const ContactDetailsSchema = z
  .object({
    user_name: z.string().nullable(),
    email: z.string().nullable(),
    zip: z.string().nullable(),
  })
  .transform(data => ({
    userName: data.user_name,
    email: data.email,
    zip: data.zip,
  }));

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
  .transform(data => ({
    userType: data.user_type,
    teacherFirstName: data.teacher_first_name,
    teacherSecondName: data.teacher_second_name,
    teacherEmail: data.teacher_email,
    ncesSchoolId: data.nces_school_id,
    schoolName: data.school_name,
    schoolAddress1: data.school_address_1,
    schoolAddress2: data.school_address_2,
    schoolAddress3: data.school_address_3,
    schoolCity: data.school_city,
    schoolState: data.school_state,
    schoolZip: data.school_zip,
    afeHighNeeds: data.afe_high_needs,
  }));

export const DonorTeacherBannerDetailsStudentSchema = z
  .object({
    user_type: z.literal('student'),
  })
  .transform(data => ({
    userType: data.user_type,
  }));

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
  .transform(data => ({
    nextCensusDisplay: data.next_census_display,
  }));

export const HasDismissedPersonalizationAlertSchema = z
  .object({
    has_dismissed_personalization_alert: z.boolean(),
  })
  .transform(data => ({
    hasDismissedPersonalizationAlert: data.has_dismissed_personalization_alert,
  }));
