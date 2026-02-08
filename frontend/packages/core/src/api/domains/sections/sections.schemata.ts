import {z} from 'zod';
import camelcaseKeys from 'camelcase-keys';

import {ParticipantAudiences} from '../courses';

export const SectionLoginTypes = {
  Word: 'word',
  Picture: 'picture',
  Email: 'email',
  GoogleClassroom: 'google_classroom',
  Clever: 'clever',
  LtiV1: 'lti_v1',
} as const;

export const SectionParticipationTypes = ParticipantAudiences;

export const AssignmentCourseVersionUnitSchema = z.object({
  id: z.number(),
  name: z.string(),
  path: z.string(),
  lessonExtrasAvailable: z.boolean(),
  position: z.number().optional(),
});

export const AssignmentCourseVersionUnitsSchema = z.record(
  z.string(),
  AssignmentCourseVersionUnitSchema,
);

export const AssignmentCourseVersionSchema = z.object({
  id: z.number(),
  key: z.string(),
  versionYear: z.string(),
  contentRootId: z.number(),
  name: z.string(),
  path: z.string(),
  type: z.string(),
  isStable: z.boolean(),
  isRecommended: z.boolean(),
  localeCodes: z.array(z.string()),
  locales: z.array(z.string()),
  units: AssignmentCourseVersionUnitsSchema,
});

export const AssignmentCourseVersionsSchema = z.record(
  z.string(),
  AssignmentCourseVersionSchema,
);

export const AssignmentCourseOfferingSchema = z.object({
  courseVersions: AssignmentCourseVersionsSchema,
});

export const AssignmentCourseOfferingsSchema = z.array(
  AssignmentCourseOfferingSchema,
);

export const AvailableParticipantTypesSchema = z.object({
  availableParticipantTypes: z.array(
    z.enum(Object.values(SectionParticipationTypes)),
  ),
});

export const SelectedUnitSchema = z
  .object({
    id: z.number().nullable(),
    name: z.string().nullable(),
    project_sharing: z.boolean().nullable(),
  })
  .transform(data => camelcaseKeys(data, {deep: true}));

export const SectionCourseSchema = z
  .object({
    course_offering_id: z.number(),
    version_id: z.number().nullable(),
    unit_id: z.number().nullable(),
    lesson_extras_available: z.boolean(),
    text_to_speech_enabled: z.boolean(),
  })
  .transform(data => camelcaseKeys(data, {deep: true}));

export const SectionInstructorInfoSchema = z
  .object({
    instructor_email: z.string(),
    instructor_name: z.string(),
    status: z.string(),
    id: z.number(),
  })
  .transform(data => camelcaseKeys(data, {deep: true}));

export const SectionInstructorSchema = z
  .object({
    instructor_email: z.string(),
    instructor_name: z.string(),
    invited_by_name: z.string().nullable(),
    invited_by_email: z.string().nullable(),
    section_id: z.string().nullable(),
    section_name: z.string().nullable(),
    participant_type: z
      .enum(Object.values(SectionParticipationTypes))
      .nullable(),
    status: z.string(),
    id: z.number(),
  })
  .transform(data => camelcaseKeys(data, {deep: true}));

export const SectionPrimaryInstructorSchema = z.object({
  email: z.string(),
  name: z.string(),
  ltiRosterSyncEnabled: z.boolean().nullable(),
});

export const SectionStudentSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    username: z.string(),
    given_name: z.string().nullable(),
    family_name: z.string().nullable(),
    email: z.string(),
    hashed_email: z.string(),
    user_type: z.string(),
    gender: z.string().nullable(),
    gender_teacher_input: z.string().nullable(),
    birthday: z.string(),
    secret_words: z.string(),
    secret_picture_name: z.string(),
    secret_picture_url: z.string(),
    location: z.string(),
    age: z.number(),
    sharing_disabled: z.boolean(),
    has_ever_signed_in: z.boolean(),
    ai_tutor_access_denied: z.boolean(),
    at_risk_age_gated_date: z.string().nullable(),
    child_account_compliance_state: z.string().nullable(),
    latest_permission_request_sent_at: z.string().nullable(),
    us_state: z.string().nullable(),
  })
  .transform(data => camelcaseKeys(data, {deep: true}));

export const SelectedSectionSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    students: z.array(SectionStudentSchema),
    login_type_name: z.string(),
    script: SelectedUnitSchema.nullable(),
    course: SectionCourseSchema.nullable(),
    any_student_has_progress: z.boolean(),
    is_assigned_single_unit_course: z.boolean().nullable(),
    primaryInstructor: SectionPrimaryInstructorSchema.nullable(),
    avatar_color: z.number(),
    avatar_emoji: z.number(),
  })
  .transform(data => camelcaseKeys(data, {deep: true}));

export const ConciseSectionSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    courseVersionName: z.string().nullable(),
    unitName: z.string().nullable(),
    unitPosition: z.number().nullable(),
    createdAt: z.string(),
    login_type: z.enum(Object.values(SectionLoginTypes)),
    grades: z.array(z.string()),
    providerManaged: z.boolean(),
    lesson_extras: z.boolean(),
    pairing_allowed: z.boolean(),
    tts_autoplay_enabled: z.boolean(),
    sharing_disabled: z.boolean(),
    studentCount: z.number(),
    code: z.string(),
    course_display_name: z.string().nullable(),
    course_offering_id: z.number().nullable(),
    course_version_id: z.number().nullable(),
    unit_id: z.number().nullable(),
    course_id: z.number().nullable(),
    hidden: z.boolean(),
    restrict_section: z.boolean(),
    post_milestone_disabled: z.boolean(),
    code_review_expires_at: z.number().nullable(),
    is_assigned_csa: z.boolean(),
    participant_type: z.enum(Object.values(SectionParticipationTypes)),
    sectionInstructors: z.array(SectionInstructorInfoSchema),
    sync_enabled: z.boolean().nullable(),
    ai_tutor_enabled: z.boolean(),
    avatar_color: z.number(),
    avatar_emoji: z.number(),
    at_risk_age_gated_date: z.string().nullable(),
    at_risk_age_gated_us_state: z.string().nullable(),
  })
  .transform(data => camelcaseKeys(data, {deep: true}));

export const SectionSchema = z.intersection(
  SelectedSectionSchema,
  ConciseSectionSchema,
);
