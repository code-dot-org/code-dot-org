import {z} from 'zod';

export const SectionLoginTypes = {
  Word: 'word',
  Picture: 'picture',
  Email: 'email',
  GoogleClassroom: 'google_classroom',
  Clever: 'clever',
  LtiV1: 'lti_v1',
} as const;

export const SectionParticipationTypes = {
  Facilitator: 'facilitator',
  Teacher: 'teacher',
  Student: 'student',
} as const;

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
  .transform(data => ({
    id: data.id,
    name: data.name,
    projectSharing: data.project_sharing,
  }));

export const SectionCourseSchema = z
  .object({
    course_offering_id: z.number(),
    version_id: z.number().nullable(),
    unit_id: z.number().nullable(),
    lesson_extras_available: z.boolean(),
    text_to_speech_enabled: z.boolean(),
  })
  .transform(data => ({
    courseOfferingId: data.course_offering_id,
    versionId: data.version_id,
    unitId: data.unit_id,
    lessonExtrasAvailable: data.lesson_extras_available,
    textToSpeechEnabled: data.text_to_speech_enabled,
  }));

export const SectionInstructorInfoSchema = z
  .object({
    instructor_email: z.string(),
    instructor_name: z.string(),
    status: z.string(),
    id: z.number(),
  })
  .transform(data => ({
    instructorEmail: data.instructor_email,
    instructorName: data.instructor_name,
    status: data.status,
    id: data.id,
  }));

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
  .transform(data => ({
    instructorEmail: data.instructor_email,
    instructorName: data.instructor_name,
    invitedByName: data.invited_by_name,
    invitedByEmail: data.invited_by_email,
    section_name: data.section_name,
    section_id: data.section_id,
    status: data.status,
    id: data.id,
    participantType: data.participant_type,
  }));

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
  .transform(data => ({
    id: data.id,
    name: data.name,
    username: data.username,
    givenName: data.given_name,
    familyName: data.family_name,
    email: data.email,
    hashedEmail: data.hashed_email,
    userType: data.user_type,
    gender: data.gender,
    genderTeacherInput: data.gender_teacher_input,
    birthday: data.birthday,
    secretWords: data.secret_words,
    secretPictureName: data.secret_picture_name,
    secretPictureUrl: data.secret_picture_url,
    location: data.location,
    age: data.age,
    sharingDisabled: data.sharing_disabled,
    hasEverSignedIn: data.has_ever_signed_in,
    aiTutorAccessDenied: data.ai_tutor_access_denied,
    atRiskAgeGatedDate: data.at_risk_age_gated_date,
    childAccountComplianceState: data.child_account_compliance_state,
    latestPermissionRequestSentAt: data.latest_permission_request_sent_at,
    usState: data.us_state,
  }));

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
  .transform(data => ({
    id: data.id,
    name: data.name,
    students: data.students,
    loginTypeName: data.login_type_name,
    script: data.script,
    course: data.course,
    anyStudentHasProgress: data.any_student_has_progress,
    isAssignedSingleUnitCourse: data.is_assigned_single_unit_course,
    primaryInstructor: data.primaryInstructor,
    avatarColor: data.avatar_color,
    avatarEmoji: data.avatar_emoji,
  }));

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
  .transform(data => ({
    id: data.id,
    name: data.name,
    courseVersionName: data.courseVersionName,
    unitName: data.unitName,
    unitPosition: data.unitPosition,
    createdAt: data.createdAt,
    loginType: data.login_type,
    grades: data.grades,
    providerManaged: data.providerManaged,
    lessonExtras: data.lesson_extras,
    pairingAllowed: data.pairing_allowed,
    ttsAutoplayEnabled: data.tts_autoplay_enabled,
    sharingDisabled: data.sharing_disabled,
    studentCount: data.studentCount,
    code: data.code,
    courseDisplayName: data.course_display_name,
    courseOfferingId: data.course_offering_id,
    courseVersionId: data.course_version_id,
    unitId: data.unit_id,
    courseId: data.course_id,
    hidden: data.hidden,
    restrictSection: data.restrict_section,
    postMilestoneDisabled: data.post_milestone_disabled,
    codeReviewExpiresAt: data.code_review_expires_at,
    isAssignedCsa: data.is_assigned_csa,
    participantType: data.participant_type,
    sectionInstructors: data.sectionInstructors,
    syncEnabled: data.sync_enabled,
    aiTutorEnabled: data.ai_tutor_enabled,
    avatarColor: data.avatar_color,
    avatarEmoji: data.avatar_emoji,
    atRiskAgeGatedDate: data.at_risk_age_gated_date,
    atRiskAgeGatedUsState: data.at_risk_age_gated_us_state,
  }));

export const SectionSchema = z.intersection(
  SelectedSectionSchema,
  ConciseSectionSchema,
);
