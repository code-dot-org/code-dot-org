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
  id: number | null;
  name: string;
  createdAt: string;
  loginType: keyof typeof SectionLoginType;
  lessonExtras: boolean;
  pairingAllowed: boolean;
  ttsAutoplayEnabled: boolean;
  studentCount: number;
  code: string;
  courseOfferingId: number | null;
  courseVersionId: number | null;
  unitId: number | null;
  courseId: number | null;
  scriptId: number;
  grades: string[];
  providerManaged: boolean;
  restrictSection: boolean;
  postMilestoneDisabled: boolean;
  syncEnabled: boolean;
  sharingDisabled: boolean;
  participantType: string | undefined;
  courseDisplayName: string | null;
  hidden: boolean;
  aiTutorEnabled: boolean;
}

export type OAuthSectionTypeName = keyof typeof OAuthSectionTypes;
export type ServerOAuthSectionTypeName = OAuthSectionTypeName | 'google_oauth2';

export interface ServerSection {
  id: number | null;
  name: string;
  createdAt?: string;
  login_type: string;
  lesson_extras: boolean;
  pairing_allowed: boolean;
  tts_autoplay_enabled?: boolean;
  studentCount: number;
  code: string;
  course_offering_id?: number | null;
  course_version_id?: number | null;
  unit_id?: number | null;
  course_id: number | null;
  script_id?: number;
  grades?: string[];
  provider_managed?: boolean;
  restrict_section?: boolean;
  post_milestone_disabled?: boolean;
  sync_enabled?: boolean;
  sharing_disabled: boolean;
  participant_type: string | undefined;
  course_display_name?: string | null;
  hidden: boolean;
  ai_tutor_enabled?: boolean;
}

export interface Student {
  sectionId: number;
  id: number;
  name: string;
  familyName: string;
  sharingDisabled: boolean;
  secretPicturePath: string;
  secretPictureName: string;
  secretWords: string;
  userType: keyof typeof UserTypes;
}

//TODO: better types here
export interface AssignmentCourseOffering {
  elementary: object;
  high: object;
  hoc: object;
  middle: object;
}

//TODO will probably need to convert other shapes from templates/teacherDashboard/shapes

export type SectionMap = {[key: number]: Section};
