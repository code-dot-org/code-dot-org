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
