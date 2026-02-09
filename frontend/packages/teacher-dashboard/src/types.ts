// Based partly on the generated curriculum shared constants.

import type {
  Section,
  SectionLoginType,
  SectionParticipationType,
} from '@code-dot-org/core/api';
import type {UserType, OAuthSectionType} from '@code-dot-org/platform/user';

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
  participantType?: SectionParticipationType;
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

export interface SectionStudent {
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
