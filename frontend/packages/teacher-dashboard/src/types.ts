// Based partly on the generated curriculum shared constants.

import {Section, SectionLoginType} from '@code-dot-org/api/models/sections';
import {UserType, OAuthSectionType} from '@code-dot-org/user';

export enum PublishedState {
  InDevelopment = 'in_development',
  Pilot = 'pilot',
  Beta = 'beta',
  Preview = 'preview',
  Stable = 'stable',
  Sunsetting = 'sunsetting',
  Deprecated = 'deprecated',
}

export enum InstructionType {
  TeacherLed = 'teacher_led',
  SelfPaced = 'self_paced',
}

export enum ParticipantAudience {
  Facilitator = 'facilitator',
  Teacher = 'teacher',
  Student = 'student',
}

export enum InstructorAudience {
  UniversalInstructor = 'universal_instructor',
  PLCReviewer = 'plc_reviewer',
  Facilitator = 'facilitator',
  Teacher = 'teacher',
}

export const CurriculumUmbrella = {
  CSF: 'CSF',
  CSD: 'CSD',
  CSP: 'CSP',
  CSA: 'CSA',
  HOC: 'HOC',
  foundations_of_cs: 'AIF',
  foundations_of_programming: 'Foundations of Programming',
  CSC_K_5: 'CSC K-5',
  CSC_6_8: 'CSC 6-8',
  CSC_9_12: 'CSC 9-12',
  special_topics_k_5: 'K-5 Special topics',
  special_topics_6_8: '6-8 Special topics',
  special_topics_9_12: '9-12 Special topics',
  pd_for_facilitators: 'PD for Facilitators',
  pd_workshop_activity_csf: 'PD Workshop Activity CSF',
  pd_workshop_activity_csd: 'PD Workshop Activity CSD',
  pd_workshop_activity_csp: 'PD Workshop Activity CSP',
  pd_workshop_activity_csa: 'PD Workshop Activity CSA',
  CSA_self_paced_pl: 'Self-paced PL - CSA',
  CSP_self_paced_pl: 'Self-paced PL - CSP',
  CSD_self_paced_pl: 'Self-paced PL - CSD',
  CSF_self_paced_pl: 'Self-paced PL - CSF',
  CSC_k_5_self_paced_pl: 'Self-paced PL - CSC K-5',
  foundations_of_cs_selfpaced_pl: 'Self-paced PL - AIF',
  ai_for_teachers_selfpaced_pl: 'Self-paced PL - AI for teachers',
  special_topics_curriculum_selfpaced_pl_k_5:
    'Self-paced PL - K-5 special topics',
  special_topics_curriculum_selfpaced_pl_6_8:
    'Self-paced PL - 6-8 special topics',
  special_topics_curriculum_selfpaced_pl_9_12:
    'Self-paced PL - 9-12 special topics',
  pedagogy_special_topics_selfpaced_pl:
    'Self-paced PL - Pedagogy special topics',
  cs_basics_selfpaced_pl: 'Self-paced PL - CS Basics',
  other: 'Other',
};

export const CurriculumTopicTags = {
  ai: 'AI',
  maker: 'Maker',
  music_lab: 'Music lab',
  survey: 'Survey',
  data_science: 'Data Science',
};

export const CurriculumContentArea = {
  curriculum_k_5: 'K-5 Curriculum',
  curriculum_6_8: '6-8 Curriculum',
  curriculum_9_12: '9-12 Curriculum',
  hoc: 'HOC',
  pl_workshop_activities: 'PL Workshop activities',
  self_paced_pl_k_5: 'K-5 self-paced PL',
  self_paced_pl_6_8: '6-8 self-paced PL',
  self_paced_pl_9_12: '9-12 self-paced PL',
  skills_focused_self_paced_pl: 'Skills-focused self-paced PL',
  pd_for_facilitators: 'PD for Facilitators',
  other: 'Other',
};

export const CourseOfferingCurriculumTypes = {
  module: 'Module',
  course: 'Course',
  standalone_unit: 'Standalone Unit',
  hoc: 'Hour of Code',
  pl: 'Professional Learning',
};

export const CourseOfferingHeaders = {
  favorites: 'Favorites',
  labs_and_skills: 'Labs and Skills',
  minecraft: 'Minecraft',
  hello_world: 'Hello World',
  popular_media: 'Popular Media',
  sports: 'Sports',
  express: 'Express',
  csf: 'CS Fundamentals',
  csc: 'CS Connections',
  year_long: 'Year Long',
  csa_labs: 'CSA Labs',
  self_paced: 'Self-Paced',
  teacher_led: 'Teacher-Led',
  collections: 'Collections',
  workshops_k5: 'K-5 Workshops',
  summer_workshops_612: '6-12 Summer Workshops',
  virtual_academic_year_workshops_612: '6–12 Virtual Academic Year Workshops',
  unsupported: 'Unsupported',
};

export const CourseOfferingMarketingInitiatives = {
  hoc: 'HOC',
  csc: 'CSC',
  csf: 'CSF',
  csa: 'CSA',
  csp: 'CSP',
  csd: 'CSD',
  aif: 'AIF',
};

export const CourseOfferingCsTopics = [
  'art_and_design',
  'app_design',
  'artificial_intelligence',
  'cybersecurity',
  'data',
  'digital_literacy',
  'games_and_animations',
  'internet',
  'physical_computing',
  'web_design',
  'programming',
];

export const CourseOfferingSchoolSubjects = [
  'math',
  'science',
  'english_language_arts',
  'history',
];

export enum DeviceType {
  Computer = 'computer',
  Chromebook = 'chromebook',
  Tablet = 'tablet',
  Mobile = 'mobile',
  NoDevice = 'no_device',
}

export const DeviceTypes = Object.values(DeviceType);

export enum DeviceCompatibilityLevel {
  Ideal = 'ideal',
  NotRecommended = 'not_recommended',
  Incompatible = 'incompatible',
}

export const DeviceCompatibilityLevels = Object.values(
  DeviceCompatibilityLevel,
);

export const ParticipantAudiencesByType = {
  student: ['student'],
  teacher: ['student', 'teacher'],
  facilitator: ['student', 'teacher', 'facilitator'],
};

// Typescript definitions for types relating to teacherSections. Note that many
// of these are "duplicated" in `/templates/teacherDashboard/shapes.jsx, which defined
// these using PropTypes for usage in Javascript React components. As we move towards
// typescript we can deprecate the PropTypes definitions and use these instead.

export interface UserEditableSection {
  aiTutorEnabled?: boolean;
  codeReviewExpiresAt?: number;
  courseId?: number | null;
  courseOfferingId?: number | null;
  courseVersionId?: number | null;
  grades?: string[];
  hidden?: boolean;
  lessonExtras?: boolean;
  loginType?: SectionLoginType;
  name?: string;
  pairingAllowed?: boolean;
  participantType?: string;
  restrictSection?: boolean;
  ttsAutoplayEnabled?: boolean;
  unitId?: number | null;
}

export type ServerOAuthSectionType = OAuthSectionType | 'google_oauth2';

export interface ServerCourse {
  course_offering_id: number | null;
  version_id: number | null;
  unit_id: number | null;
  lesson_extras_available: boolean;
  text_to_speech_enabled: boolean;
}

export interface ServerSectionInstructor {
  id: number;
  status: string;
  instructor_email: string;
  instructor_name: string;
  section_name: string;
  section_id: number;
  participant_type: string;
  invited_by_email: string;
  invited_by_name: string;
}

export interface ServerSection {
  ai_tutor_enabled?: boolean;
  at_risk_age_gated_date?: string;
  at_risk_age_gated_us_state?: string;
  any_student_has_progress?: boolean;
  code: string;
  course?: ServerCourse | null;
  course_display_name?: string | null;
  course_id: number | null;
  course_offering_id?: number | null;
  courseVersionName?: string;
  course_version_id?: number | null;
  createdAt?: string;
  code_review_expires_at?: string;
  is_assigned_csa?: boolean;
  sectionInstructors?: ServerSectionInstructor[];
  primaryInstructor?: string;
  grades?: string[];
  hidden: boolean;
  id: number;
  isAssignedStandaloneCourse: boolean;
  is_assigned_single_unit_course?: boolean;
  lesson_extras: boolean;
  login_type: SectionLoginType;
  login_type_name?: string;
  name: string;
  pairing_allowed: boolean;
  participant_type?: string;
  post_milestone_disabled?: boolean;
  provider_managed?: boolean;
  providerManaged?: boolean;
  restrict_section?: boolean;
  script_id?: number;
  sharing_disabled: boolean;
  studentCount: number;
  sync_enabled?: boolean;
  tts_autoplay_enabled?: boolean;
  unit_id?: number | null;
  script?: {
    id: number;
    name: string;
  };
  unitName?: string;
  unitPosition?: number | null;
  avatar_color?: number | null;
  avatar_emoji?: number | null;
}

export interface Student {
  familyName: string;
  id: number;
  name: string;
  secretPictureName: string;
  secretPictureUrl: string;
  secretWords: string;
  sectionId: number;
  sharingDisabled: boolean;
  userType: UserType;
}

export interface ServerStudent {
  family_name: string;
  id: number;
  name: string;
  secret_picture_name: string;
  secret_picture_path?: string; // @deprecated Use `secret_picture_url` instead
  secret_picture_url: string;
  secret_words: string;
  sectionId: number;
  sharing_disabled: boolean;
  user_type: UserType;
}

export interface AssignmentCourseVersionUnit {
  id: number;
  name: string;
  path: string;
  lessonExtrasAvailable: boolean;
  position?: number;
}

export interface AssignmentCourseVersionUnits {
  [key: string]: AssignmentCourseVersionUnit;
}

export interface AssignmentCourseVersion {
  id: number;
  key: string;
  versionYear: string;
  contentRootId: number;
  name: string;
  path: string;
  type: string;
  isStable: boolean;
  isRecommended: boolean;
  localeCodes: string[];
  locales: string[];
  units: AssignmentCourseVersionUnits;
}

export interface AssignmentCourseVersions {
  [key: string]: AssignmentCourseVersion;
}

export interface AssignmentCourseOffering {
  courseVersions: AssignmentCourseVersions;
}

export type Classroom = {
  enrollment_code: string;
  id: string;
  name: string;
  section: string | null;
};

type LtiSection = {
  name: string;
  size: number;
};

export type LtiSectionSyncResult = {
  all: {[key: number]: LtiSection};
  changed: {[key: number]: LtiSection};
  error?: string;
};

//TODO will probably need to convert other shapes from templates/teacherDashboard/shapes

export type SectionMap = {[key: number]: Section};
