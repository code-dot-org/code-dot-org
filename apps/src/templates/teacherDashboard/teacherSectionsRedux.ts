import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import _ from 'lodash';

import {OAuthSectionTypes} from '@cdo/apps/accounts/constants';
import {ParticipantAudience} from '@cdo/apps/generated/curriculum/sharedCourseConstants';
import {
  PlGradeValue,
  SectionLoginType,
} from '@cdo/generated-scripts/sharedConstants';

import {
  sectionFromServerSection,
  studentFromServerStudent,
  newSectionData,
  USER_EDITABLE_SECTION_PROPS,
} from './teacherSectionsReduxSelectors';
import {
  AssignmentCourseOffering,
  OAuthSectionTypeName,
  ServerOAuthSectionTypeName,
  Section,
  ServerSection,
  SectionMap,
  Student,
  UserEditableSection,
  SectionInstructor,
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
  sectionBeingEdited: Section | null;
  showSectionEditDialog: boolean;
  saveInProgress: boolean;
  // Track whether we've async-loaded our section and assignment data
  asyncLoadComplete: boolean;
  // Whether the roster dialog (used to import sections from google/clever) is open.
  isRosterDialogOpen: boolean;
  // Track a section's roster provider. Must be of type OAuthSectionTypes.
  rosterProvider: RosterProvider;
  rosterProviderName: string | null;
  // Set of oauth classrooms available for import from a third-party source.
  // Not populated until the RosterDialog is opened.
  classrooms: null;
  // Error that occurred while loading oauth classrooms
  loadError: {status: number; message: string} | null;
  // The page where the action is occurring
  pageType: string;
  // DCDO Flag - show/hide Lock Section field
  showLockSectionField: boolean | null;
  ltiSyncResult: null;
  isLoadingSectionData: boolean;
  initialCourseId?: number | null;
  initialUnitId?: number | null;
  initialCourseOfferingId?: number | null;
  initialCourseVersionId?: number | null;
  initialLoginType?: keyof typeof SectionLoginType;
  coteacherInvite?: SectionInstructor;
  coteacherInviteForPl?: SectionInstructor;
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
  rosterProviderName: null,
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
    selectSection(state, action: PayloadAction<string>) {
      let sectionId: number | null;
      action.payload && state.sectionIds.includes(parseInt(action.payload, 10))
        ? (sectionId = parseInt(action.payload, 10))
        : (sectionId = NO_SECTION);
      state.selectedSectionId = sectionId;
      state.selectedSectionName =
        sectionId !== NO_SECTION ? state.sections[sectionId].name : '';
    },
    updateSelectedSection(state, action: PayloadAction<ServerSection>) {
      const sectionId = action.payload.id;
      const oldSection: Section = sectionId
        ? state.sections[sectionId]
        : (sectionFromServerSection(action.payload) as Section);
      if (sectionId) {
        state.sections = {
          ...state.sections,
          [sectionId]: {
            ...oldSection,
            ...(sectionFromServerSection(action.payload) as Section),
          },
        };
      }
    },
    setSections(state, action: PayloadAction<ServerSection[]>) {
      const sections: Section[] = action.payload.map(
        section => sectionFromServerSection(section) as Section
      );

      let selectedSectionId = state.selectedSectionId;
      // If we have only one section, autoselect it
      if (Object.keys(action.payload).length === 1) {
        selectedSectionId = action.payload[0].id;
      }

      sections.forEach(section => {
        // SET_SECTIONS is called in two different contexts. On some pages it is called
        // in a way that only provides name/id per section, in other places (homepage, unit overview)
        // it provides more detailed information. There are currently no pages where
        // it should be called in both manners, but we want to make sure that if it
        // were it will throw an error rather than destroy data.
        const prevSection = state.sections[section.id];
        if (prevSection) {
          Object.keys(section).forEach(key => {
            if (
              section[key as keyof Section] === undefined &&
              prevSection[key as keyof Section] !== undefined
            ) {
              throw new Error(
                'SET_SECTIONS called multiple times in a way that would remove data'
              );
            }
          });
        }
      });

      const sectionIds = _.uniq(
        state.sectionIds.concat(sections.map(section => section.id))
      );

      const studentSectionIds = sections
        .filter(
          section => section.participantType === ParticipantAudience.student
        )
        .map(section => section.id);
      const plSectionIds = sections
        .filter(
          section => section.participantType !== ParticipantAudience.student
        )
        .map(section => section.id);

      state.sectionsAreLoaded = true;
      state.selectedSectionId = selectedSectionId;
      state.sectionIds = sectionIds;
      state.studentSectionIds = studentSectionIds;
      state.plSectionIds = plSectionIds;
      state.sections = {
        ...state.sections,
        ..._.keyBy(sections, 'id'),
      };
    },
    startLoadingSectionData(state) {
      state.isLoadingSectionData = true;
    },
    finishLoadingSectionData(state) {
      state.isLoadingSectionData = false;
    },
    setStudentsForCurrentSection(
      state,
      action: PayloadAction<{
        sectionId: number;
        students: Student[];
      }>
    ) {
      const students = action.payload.students || [];
      const selectedStudents = students.map(
        student =>
          studentFromServerStudent(student, action.payload.sectionId) as Student
      );

      state.selectedStudents = selectedStudents;
    },
    setRosterProviderName(state, action: PayloadAction<string>) {
      state.rosterProviderName = action.payload;
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
    setCourseOfferings(
      state,
      action: PayloadAction<AssignmentCourseOffering[]>
    ) {
      state.courseOfferings = action.payload;
      state.courseOfferingsAreLoaded = true;
    },
    setAvailableParticipantTypes(state, action: PayloadAction<string[]>) {
      state.availableParticipantTypes = action.payload;
    },
    setShowLockSectionField(state, action: PayloadAction<boolean>) {
      state.showLockSectionField = action.payload;
    },
    setSectionCodeReviewExpiresAt(
      state,
      action: PayloadAction<{
        sectionId: number;
        codeReviewExpiresAt: string;
      }>
    ) {
      // const {sectionId, codeReviewExpiresAt} = action.payload;
      const section = state.sections[action.payload.sectionId];
      if (!section) {
        throw new Error('section does not exist');
      }

      state.sections = {
        ...state.sections,
        [action.payload.sectionId]: {
          ...state.sections[action.payload.sectionId],
          codeReviewExpiresAt: action.payload.codeReviewExpiresAt
            ? Date.parse(action.payload.codeReviewExpiresAt)
            : null,
        },
      };
    },
    removeSection(state, action: PayloadAction<number>) {
      const sectionId = action.payload;
      const section = state.sections[sectionId];
      if (!section) {
        throw new Error('section does not exist');
      }
      state.sectionIds = _.without(state.sectionIds, sectionId);
      state.studentSectionIds = _.without(state.studentSectionIds, sectionId);
      state.plSectionIds = _.without(state.plSectionIds, sectionId);
      state.sections = _.omit(state.sections, sectionId);
    },
    beginCreatingSection(
      state,
      action: PayloadAction<{
        courseOfferingId: number;
        courseVersionId: number;
        unitId: number;
        participantType: string;
      }>
    ) {
      const initialSectionData = newSectionData(
        action.payload.participantType
      ) as Section;
      if (action.payload.courseOfferingId) {
        initialSectionData.courseOfferingId = action.payload.courseOfferingId;
      }
      if (action.payload.courseVersionId) {
        initialSectionData.courseVersionId = action.payload.courseVersionId;
      }
      if (action.payload.unitId) {
        initialSectionData.unitId = action.payload.unitId;
      }
      state.initialCourseId = initialSectionData.courseId;
      state.initialUnitId = initialSectionData.unitId;
      state.initialCourseOfferingId = initialSectionData.courseOfferingId;
      state.initialCourseVersionId = initialSectionData.courseVersionId;
      state.initialLoginType = initialSectionData.loginType;
      state.sectionBeingEdited = initialSectionData;
    },
    beginEditingSection(
      state,
      action: PayloadAction<{sectionId?: number | null; silent?: boolean}>
    ) {
      const silent = action.payload.silent ? action.payload.silent : false;
      const initialParticipantType =
        state.availableParticipantTypes.length === 1
          ? state.availableParticipantTypes[0]
          : undefined;
      const initialSectionData = action.payload.sectionId
        ? {...state.sections[action.payload.sectionId]}
        : newSectionData(initialParticipantType);
      return {
        ...state,
        initialCourseId: initialSectionData.courseId,
        initialUnitId: initialSectionData.unitId,
        initialCourseOfferingId: initialSectionData.courseOfferingId,
        initialCourseVersionId: initialSectionData.courseVersionId,
        initialLoginType: initialSectionData.loginType,
        sectionBeingEdited: initialSectionData,
        showSectionEditDialog: !silent,
      };
    },
    editSectionProperties(state, action: PayloadAction<UserEditableSection>) {
      if (!state.sectionBeingEdited) {
        throw new Error(
          'Cannot edit section properties; no section is' +
            ' currently being edited.'
        );
      }

      for (const key in action.payload) {
        if (!USER_EDITABLE_SECTION_PROPS.includes(key)) {
          throw new Error(`Cannot edit property ${key}; it's not allowed.`);
        }
      }

      // PL Sections must use email logins and its grade value should be "pl"
      if (
        action.payload.participantType &&
        action.payload.participantType !== ParticipantAudience.student
      ) {
        state.sectionBeingEdited.loginType = SectionLoginType.email;
        state.sectionBeingEdited.grades = [PlGradeValue];
      }

      if (action.payload.unitId && action.payload.lessonExtras === undefined) {
        state.sectionBeingEdited.lessonExtras = true;
      }

      if (
        action.payload.unitId &&
        action.payload.ttsAutoplayEnabled === undefined
      ) {
        state.sectionBeingEdited.ttsAutoplayEnabled = false;
      }

      state.sectionBeingEdited = {
        ...state.sectionBeingEdited,
        ...action.payload,
      };
    },
    cancelEditingSession(state) {
      state.sectionBeingEdited = null;
    },
    setCoteacherInvite(state, action: PayloadAction<SectionInstructor>) {
      state.coteacherInvite = action.payload;
    },
    setCoteacherInviteForPl(state, action: PayloadAction<SectionInstructor>) {
      state.coteacherInviteForPl = action.payload;
    },
    cancelImportRosterFlow(state) {
      state.isRosterDialogOpen = false;
      state.rosterProvider = null;
      state.classrooms = null;
    },
    rosterImportFailed(
      state,
      action: PayloadAction<{status: number; message: string}>
    ) {
      state.loadError = {
        status: action.payload.status,
        message: action.payload.message,
      };
    },
  },
});

//Thunks

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
  selectSection,
  setSections,
  updateSelectedSection,
  startLoadingSectionData,
  setStudentsForCurrentSection,
  setRosterProviderName,
  finishLoadingSectionData,

  // Not implemented yet
  setCourseOfferings,
  setAvailableParticipantTypes,
  setShowLockSectionField,
  setSectionCodeReviewExpiresAt,
  removeSection,
  beginCreatingSection,
  beginEditingSection,
  editSectionProperties,
  cancelEditingSession,
  setCoteacherInvite,
  setCoteacherInviteForPl,
  cancelImportRosterFlow,
  rosterImportFailed,
  // Lots of other reducers need to be implemented too, but not essential for
  // type-checking (perhaps not included from any TS files?)
} = {
  ...sectionSlice.actions,

  // Method signatures to allow compiler type-checking to pass. Delete when implemented.
};

export default sectionSlice.reducer;
