export const SectionLoginType = {
  Word: 'word',
  Picture: 'picture',
  Email: 'email',
  GoogleClassroom: 'google_classroom',
  Clever: 'clever',
  LtiV1: 'lti_v1',
} as const;

export type SectionLoginTypeKey =
  (typeof SectionLoginType)[keyof typeof SectionLoginType];

/** Describes the course attached to a Section */
export interface Course {
  courseOfferingId?: number;
  versionId?: number;
  unitId?: number;
  lessonExtrasAvailable: boolean;
  textToSpeechEnabled: boolean;
}

export interface SectionInstructor {
  id: number;
  instructorEmail: string;
  instructorName: string;
  invitedByEmail: string;
  invitedByName: string;
  participantType: string;
  sectionId: number;
  sectionName: string;
  status: string;
}

export interface Section {
  aiTutorEnabled: boolean;
  atRiskAgeGatedDate?: Date;
  atRiskAgeGatedUsState?: string;
  anyStudentHasProgress?: boolean;
  code: string;
  codeReviewExpiresAt?: number;
  course?: Course;
  courseDisplayName?: string;
  courseId?: number;
  courseOfferingId?: number;
  courseVersionId?: number;
  courseVersionName?: string;
  createdAt?: string;
  grades: string[];
  hidden: boolean;
  id: number;
  isAssignedCSA?: boolean;
  isAssignedStandaloneCourse: boolean;
  lessonExtras: boolean;
  loginType?: SectionLoginTypeKey;
  loginTypeName?: string;
  name: string;
  pairingAllowed: boolean;
  participantType?: string;
  postMilestoneDisabled?: boolean;
  providerManaged: boolean;
  primaryInstructor?: string;
  restrictSection: boolean;
  sectionInstructors?: SectionInstructor[];
  sharingDisabled: boolean;
  studentCount: number;
  syncEnabled?: boolean;
  ttsAutoplayEnabled: boolean;
  unitId?: number;
  unitName?: string;
  unitPosition?: number;
  avatarColor?: number;
  avatarEmoji?: number;
}
