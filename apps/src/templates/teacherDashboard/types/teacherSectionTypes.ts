import {OAuthSectionTypes} from '@cdo/apps/accounts/constants';
import {
  SectionLoginType,
  UserTypes,
} from '@cdo/generated-scripts/sharedConstants';

// Typescript definitions for types relating to teacherSections. Note that many
// of these are "duplicated" in `/templates/teacherDashboard/shapes.jsx, which defined
// these using PropTypes for usage in Javascript React components. As we move towards
// typescript we can deprecate the PropTypes definitions and use these instead.

export interface Section {
  aiTutorEnabled: boolean;
  anyStudentHasProgress?: boolean;
  code: string;
  codeReviewExpiresAt?: number | null;
  courseDisplayName: string | null;
  courseId?: number | null;
  courseOfferingId?: number | null;
  courseVersionId?: number | null;
  courseVersionName?: string;
  createdAt?: string;
  grades: string[];
  hidden: boolean;
  id: number;
  isAssignedCSA?: boolean;
  isAssignedStandaloneCourse: boolean;
  lessonExtras: boolean;
  loginType?: keyof typeof SectionLoginType;
  loginTypeName?: string;
  name: string;
  pairingAllowed: boolean;
  participantType: string | undefined;
  postMilestoneDisabled?: boolean;
  providerManaged: boolean;
  restrictSection: boolean;
  sectionInstructors?: SectionInstructor[];
  sharingDisabled: boolean;
  studentCount: number;
  syncEnabled?: boolean;
  ttsAutoplayEnabled: boolean;
  unitId?: number | null;
  unitName: string | null;
}

export interface UserEditableSection {
  aiTutorEnabled?: boolean;
  codeReviewExpiresAt?: number | null;
  courseId?: number | null;
  courseOfferingId?: number | null;
  courseVersionId?: number | null;
  grades?: string[];
  hidden?: boolean;
  lessonExtras?: boolean;
  loginType?: keyof typeof SectionLoginType;
  name?: string;
  pairingAllowed?: boolean;
  participantType?: string;
  restrictSection?: boolean;
  ttsAutoplayEnabled?: boolean;
  unitId?: number | null;
}

export type OAuthSectionTypeName = keyof typeof OAuthSectionTypes;
export type ServerOAuthSectionTypeName = OAuthSectionTypeName | 'google_oauth2';

export interface ServerSection {
  ai_tutor_enabled?: boolean;
  code: string;
  course_display_name?: string | null;
  course_id: number | null;
  course_offering_id?: number | null;
  course_version_id?: number | null;
  createdAt?: string;
  grades?: string[];
  hidden: boolean;
  id: number;
  isAssignedStandaloneCourse: boolean;
  lesson_extras: boolean;
  login_type: string;
  name: string;
  pairing_allowed: boolean;
  participant_type?: string;
  post_milestone_disabled?: boolean;
  provider_managed?: boolean;
  restrict_section?: boolean;
  script_id?: number;
  sharing_disabled: boolean;
  studentCount: number;
  sync_enabled?: boolean;
  tts_autoplay_enabled?: boolean;
  unit_id?: number | null;
}

export interface Student {
  familyName: string;
  id: number;
  name: string;
  secretPictureName: string;
  secretPicturePath: string;
  secretWords: string;
  sectionId: number;
  sharingDisabled: boolean;
  userType: keyof typeof UserTypes;
}

export interface ServerStudent {
  family_name: string;
  id: number;
  name: string;
  secret_picture_name: string;
  secret_picture_path: string;
  secret_words: string;
  sectionId: number;
  sharing_disabled: boolean;
  user_type: keyof typeof UserTypes;
}

//TODO: better types here
export interface AssignmentCourseOffering {
  elementary: object;
  high: object;
  hoc: object;
  middle: object;
}

export type SectionInstructor = {
  instructor_email: string;
  instructor_name: string;
  invited_by_email: string;
  invited_by_name: string;
  participant_type: string;
  section_id: number;
  section_name: string;
  status: string;
};

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
