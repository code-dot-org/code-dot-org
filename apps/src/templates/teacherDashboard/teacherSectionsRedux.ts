import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {OAuthSectionTypes} from '@cdo/apps/accounts/constants';
import {
  SectionLoginType,
  // PlGradeValue,
} from '@cdo/generated-scripts/sharedConstants';

import {
  AssignmentCourseOffering,
  OAuthSectionTypeName,
  ServerOAuthSectionTypeName,
  ServerSection,
  SectionMap,
  Student,
} from './types/teacherSectionTypes';

type RosterProvider = string | keyof typeof SectionLoginType | null;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface TeacherSectionState {
  nextTempId: number;
  studioUrl: string;
  // List of teacher's authentication providers (mapped to OAuthSectionTypes
  // for consistency and ease of comparison).
  providers: OAuthSectionTypeName[]; //TODO: I think this is right???
  sectionIds: number[];
  studentSectionIds: number[];
  plSectionIds: number[];
  selectedSectionId: number | null;
  selectedSectionName: string;
  // Array of course offerings, to populate the assignment dropdown
  // with options like "CSD", "Course A", or "Frozen". See the
  // assignmentCourseOfferingShape PropType.
  courseOfferings: AssignmentCourseOffering[];
  courseOfferingsAreLoaded: boolean;
  // The participant types the user can create sections for
  availableParticipantTypes: string[];
  // Mapping from sectionId to section object
  sections: SectionMap;
  // List of students in section currently being edited (see studentShape PropType)
  selectedStudents: Student[];
  sectionsAreLoaded: boolean;
  // We can edit exactly one section at a time.
  // While editing we store that section's 'in-progress' state separate from
  // its persisted state in the sections map.
  sectionBeingEdited: number | null;
  showSectionEditDialog: boolean;
  saveInProgress: boolean;
  // Track whether we've async-loaded our section and assignment data
  asyncLoadComplete: boolean;
  // Whether the roster dialog (used to import sections from google/clever) is open.
  isRosterDialogOpen: boolean;
  // Track a section's roster provider. Must be of type OAuthSectionTypes.
  rosterProvider: RosterProvider;
  // Set of oauth classrooms available for import from a third-party source.
  // Not populated until the RosterDialog is opened.
  classrooms: null;
  // Error that occurred while loading oauth classrooms
  loadError: null;
  // The page where the action is occurring
  pageType: string;
  // DCDO Flag - show/hide Lock Section field
  showLockSectionField: null;
  ltiSyncResult: null;
  isLoadingSectionData: boolean;
}

/** @const {null} null used to indicate no section selected */
export const NO_SECTION = null;

const initialState: TeacherSectionState = {
  nextTempId: -1,
  studioUrl: '',
  // List of teacher's authentication providers (mapped to OAuthSectionTypes
  // for consistency and ease of comparison).
  providers: [],
  sectionIds: [],
  studentSectionIds: [],
  plSectionIds: [],
  selectedSectionId: NO_SECTION,
  selectedSectionName: '',
  // Array of course offerings, to populate the assignment dropdown
  // with options like "CSD", "Course A", or "Frozen". See the
  // assignmentCourseOfferingShape PropType.
  courseOfferings: [],
  courseOfferingsAreLoaded: false,
  // The participant types the user can create sections for
  availableParticipantTypes: [],
  // Mapping from sectionId to section object
  sections: {},
  // List of students in section currently being edited (see studentShape PropType)
  selectedStudents: [],
  sectionsAreLoaded: false,
  // We can edit exactly one section at a time.
  // While editing we store that section's 'in-progress' state separate from
  // its persisted state in the sections map.
  sectionBeingEdited: null,
  showSectionEditDialog: false,
  saveInProgress: false,
  // Track whether we've async-loaded our section and assignment data
  asyncLoadComplete: false,
  // Whether the roster dialog (used to import sections from google/clever) is open.
  isRosterDialogOpen: false,
  // Track a section's roster provider. Must be of type OAuthSectionTypes.
  rosterProvider: null,
  // Set of oauth classrooms available for import from a third-party source.
  // Not populated until the RosterDialog is opened.
  classrooms: null,
  // Error that occurred while loading oauth classrooms
  loadError: null,
  // The page where the action is occurring
  pageType: '',
  // DCDO Flag - show/hide Lock Section field
  showLockSectionField: null,
  ltiSyncResult: null,
  isLoadingSectionData: false,
};

// Maps authentication provider to OAuthSectionTypes for ease of comparison
// (i.e., Google auth is 'google_oauth2' but the section type is 'google_classroom').
const mapProviderToSectionType = (provider: ServerOAuthSectionTypeName) => {
  switch (provider) {
    case 'google_oauth2':
      return OAuthSectionTypes.google_classroom;
    default:
      return provider;
  }
};

const sectionSlice = createSlice({
  name: 'teacherSection',
  initialState,
  reducers: {
    setAuthProviders(state, action: PayloadAction<string[]>) {
      state.providers = action.payload.map(mapProviderToSectionType);
    },
    setRosterProvider(state, action: PayloadAction<RosterProvider>) {
      state.rosterProvider = action.payload;
    },
    setPageType(state, action: PayloadAction<string>) {
      state.pageType = action.payload;
    },
    updateSectionAiTutorEnabled: {
      reducer(
        state,
        action: PayloadAction<{
          sectionId: number;
          aiTutorEnabled: boolean;
        }>
      ) {
        const {sectionId, aiTutorEnabled} = action.payload;
        const section = state.sections[sectionId];
        if (!section) {
          throw new Error('section does not exist');
        }

        state.sections[sectionId].aiTutorEnabled = aiTutorEnabled;
      },
      prepare(sectionId: number, aiTutorEnabled: boolean) {
        return {
          payload: {
            sectionId,
            aiTutorEnabled,
          },
        };
      },
    },
  },
});

// pageType describes the current route the user is on. Used only for logging.
// Enum of allowed values:
export const pageTypes = {
  level: 'level',
  scriptOverview: 'script_overview',
  courseOverview: 'course_overview',
  lessonExtras: 'lesson_extras',
  homepage: 'homepage',
} as const;

export const {
  setAuthProviders,
  setRosterProvider,
  setPageType,
  updateSectionAiTutorEnabled,

  // Not implemented yet
  selectSection,
  setSections,
  updateSelectedSection,
  startLoadingSectionData,
  setStudentsForCurrentSection,
  setRosterProviderName,
  finishLoadingSectionData,

  // Lots of other reducers need to be implemented too, but not essential for
  // type-checking (perhaps not included from any TS files?)
} = {
  ...sectionSlice.actions,

  // Method signatures to allow compiler type-checking to pass. Delete when implemented.
  selectSection: (id: string | number) => {},
  setSections: (sections: ServerSection[]) => {},
  updateSelectedSection: (section: ServerSection) => {},
  startLoadingSectionData: () => {},
  setStudentsForCurrentSection: (id: number, students: Student[]) => {},
  setRosterProviderName: (name: string) => {},
  finishLoadingSectionData: () => {},
};

export default sectionSlice.reducer;
