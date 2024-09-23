// import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {OAuthSectionTypes} from '@cdo/apps/accounts/constants';
import {
  SectionLoginType,
  // PlGradeValue,
} from '@cdo/generated-scripts/sharedConstants';

import {
  AssignmentCourseOffering,
  SectionMap,
  Student,
} from './types/teacherSectionTypes';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface teacherSectionState {
  nextTempId: number;
  studioUrl: string;
  // List of teacher's authentication providers (mapped to OAuthSectionTypes
  // for consistency and ease of comparison).
  providers: keyof (typeof OAuthSectionTypes)[]; //TODO: I think this is right???
  sectionIds: number[];
  studentSectionIds: number[];
  plSectionIds: number[];
  selectedSectionId: number | null;
  selectedSectionName: string;
  // Array of course offerings, to populate the assignment dropdown
  // with options like "CSD", "Course A", or "Frozen". See the
  // assignmentCourseOfferingShape PropType.
  courseOfferings: AssignmentCourseOffering;
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
  rosterProvider: string | keyof typeof SectionLoginType | null;
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
