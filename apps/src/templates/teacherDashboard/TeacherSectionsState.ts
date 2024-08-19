interface CourseVersion {
  id: number;
  name: string;
  path: string;
  lesson_extras_available: boolean;
  text_to_speech_enabled: boolean;
  position: number | null;
  requires_verified_instructor: boolean;
}

interface CourseOffering {
  id: number;
  display_name: string;
  is_featured: boolean;
  participant_audience: string;
  course_versions: {[id: number]: CourseVersion};
}

interface SectionInstructor {
  id: number;
  status: 'active' | 'invited' | 'declined' | 'removed';
  instructor_name: string | null;
  instructor_email: string;
}

interface Section {
  id: number;
  name: string;
  courseVersionName: string;
  createdAt: Date;
  loginType: string;
  loginTypeName: string;
  grades: string[];
  providerManaged: boolean;
  lessonExtras: boolean;
  pairingAllowed: boolean;
  ttsAutoplayEnabled: boolean;
  sharingDisabled: boolean;
  studentCount: number;
  code: string;
  courseOfferingId: number | null;
  courseVersionId: number | null;
  courseDisplayName: string | null;
  unitId: number | null;
  courseId: number | null;
  hidden: boolean;
  restrictSection: boolean;
  postMilestoneDisabled: boolean;
  codeReviewExpiresAt: Date | null;
  isAssignedCSA: boolean;
  participantType: 'student' | 'teacher' | 'facilitator';
  sectionInstructors: SectionInstructor[];
  syncEnabled: boolean;
  aiTutorEnabled: boolean;
}

interface Student {
  sectionId: number;
  id: number;
  name: string;
  familyName: string | null;
  sharingDisabled: boolean;
  secretPicturePath: string | null;
  secretPictureName: string | null;
  secretWords: string;
  userType: 'student' | 'teacher';
}

interface LtiSyncResult {}

export interface TeacherSectionsState {
  nextTempId: number;
  studioUrl: string;
  // List of teacher's authentication providers (mapped to OAuthSectionTypes
  // for consistency and ease of comparison).
  providers: string[];
  sectionIds: number[];
  studentSectionIds: number[];
  plSectionIds: number[];
  selectedSectionId: number | null;
  // Array of course offerings, to populate the assignment dropdown
  // with options like "CSD", "Course A", or "Frozen". See the
  // assignmentCourseOfferingShape PropType.
  courseOfferings: {[id: number]: CourseOffering};
  courseOfferingsAreLoaded: boolean;
  // The participant types the user can create sections for
  availableParticipantTypes: string[];
  // Mapping from sectionId to section object
  sections: {[sectionId: number]: Section};
  // List of students in section currently being edited (see studentShape PropType)
  selectedStudents: Student[];
  sectionsAreLoaded: boolean;
  // We can edit exactly one section at a time.
  // While editing we store that section's 'in-progress' state separate from
  // its persisted state in the sections map.
  sectionBeingEdited: Section | null;
  showSectionEditDialog: boolean;
  saveInProgress: boolean;
  // Track whether we've async-loaded our section and assignment data
  asyncLoadComplete: boolean;
  // Whether the roster dialog (used to import sections from google/clever) is open.
  isRosterDialogOpen: boolean;
  // Track a section's roster provider. Must be of type OAuthSectionTypes.
  rosterProvider: string | null;
  // Set of oauth classrooms available for import from a third-party source.
  // Not populated until the RosterDialog is opened.
  classrooms: string | null;
  // Error that occurred while loading oauth classrooms
  loadError: string | null;
  // The page where the action is occurring
  pageType:
    | 'level'
    | 'script_overview'
    | 'course_overview'
    | 'lesson_extras'
    | 'homepage'
    | '';
  // DCDO Flag - show/hide Lock Section field
  showLockSectionField: boolean | null;
  ltiSyncResult: LtiSyncResult;
}
