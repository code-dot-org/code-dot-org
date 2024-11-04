import {
  createSlice,
  AnyAction,
  PayloadAction,
  ThunkAction,
  ThunkDispatch,
} from '@reduxjs/toolkit';
import _ from 'lodash';

import {OAuthSectionTypes} from '@cdo/apps/accounts/constants';
import {ParticipantAudience} from '@cdo/apps/generated/curriculum/sharedCourseConstants';
import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import firehoseClient from '@cdo/apps/metrics/firehose';
import {RootState} from '@cdo/apps/types/redux';
import {
  PlGradeValue,
  SectionLoginType,
} from '@cdo/generated-scripts/sharedConstants';

import {
  isAddingSection,
  sectionFromServerSection as untypedSectionFromServerSection,
  serverSectionFromSection,
  studentFromServerStudent,
  newSectionData,
  USER_EDITABLE_SECTION_PROPS,
} from './teacherSectionsReduxSelectors';
import {
  AssignmentCourseOffering,
  Classroom,
  LtiSectionSyncResult,
  OAuthSectionTypeName,
  Section,
  SectionInstructor,
  SectionMap,
  ServerOAuthSectionTypeName,
  ServerSection,
  ServerStudent,
  Student,
  UserEditableSection,
} from './types/teacherSectionTypes';

type RosterProvider = string | keyof typeof SectionLoginType | null;

type AssignmentData = {
  section_id: number;
  section_creation_timestamp?: string;
  page_name: string;
  unit_id?: number | null;
  course_id?: number | null;
  course_version_id?: number | null;
  course_offering_id?: number | null;
  unitName?: string | null;
};

export interface TeacherSectionState {
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
  classrooms: Classroom[] | null;
  // Error that occurred while loading oauth classrooms
  loadError: {status: number; message: string} | null;
  // The page where the action is occurring
  pageType: string;
  ltiSyncResult: LtiSectionSyncResult | null;
  isLoadingSectionData: boolean;
  initialCourseId?: number | null;
  initialUnitId?: number | null;
  initialUnitName?: string | null;
  initialCourseOfferingId?: number | null;
  initialCourseVersionId?: number | null;
  initialLoginType?: keyof typeof SectionLoginType;
  coteacherInvite?: SectionInstructor;
  coteacherInviteForPl?: SectionInstructor;
}

/** @const {null} null used to indicate no section selected */
export const NO_SECTION = null;
export const SELECT_SECTION = 'teacherSections/selectSection';

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
  sectionBeingEdited: null,
  // Error that occurred while loading oauth classrooms
  loadError: null,
  // The page where the action is occurring
  pageType: '',
  ltiSyncResult: null,
  isLoadingSectionData: false,
  initialUnitName: null,
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

const sectionFromServerSection = (section: ServerSection) =>
  untypedSectionFromServerSection(section) as Section;

const sectionSlice = createSlice({
  name: 'teacherSections',
  initialState,
  reducers: {
    setAuthProviders(state, action: PayloadAction<string[]>) {
      state.providers = action.payload.map(mapProviderToSectionType);
    },
    setRosterProvider(state, action: PayloadAction<RosterProvider>) {
      // No-op if this action is called with a non-OAuth section type,
      // since this action is triggered on every section load.
      if (
        action.payload &&
        (OAuthSectionTypes[action.payload] ||
          action.payload === SectionLoginType.lti_v1)
      ) {
        state.rosterProvider = action.payload;
      }
    },
    setPageType(state, action: PayloadAction<string>) {
      state.pageType = action.payload;
    },
    selectSection(state, action: PayloadAction<string | number>) {
      if (action.payload) {
        const id = parseInt(action.payload.toString(), 10);
        if (state.sectionIds.includes(id)) {
          state.selectedSectionId = id;
          state.selectedSectionName = state.sections[id].name;
        } else {
          state.selectedSectionId = NO_SECTION;
          state.selectedSectionName = '';
        }
      } else {
        state.selectedSectionId = NO_SECTION;
        state.selectedSectionName = '';
      }
    },
    updateSelectedSection(state, action: PayloadAction<ServerSection>) {
      const sectionId = action.payload.id;
      if (sectionId) {
        state.sections[sectionId] = {
          ...state.sections[sectionId],
          ...sectionFromServerSection(action.payload),
        };
      }
    },
    setSections: {
      reducer(
        state,
        action: PayloadAction<{
          sections: ServerSection[];
          autoSelectOnlySection: boolean;
        }>
      ) {
        const sections = action.payload.sections.map(sectionFromServerSection);

        // If we have only one section, autoselect it
        const selectedSectionId =
          action.payload.autoSelectOnlySection &&
          Object.keys(sections).length === 1
            ? action.payload.sections[0].id
            : state.selectedSectionId;

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
      prepare(sections, autoSelectOnlySection = true) {
        return {
          payload: {
            sections,
            autoSelectOnlySection,
          },
        };
      },
    },
    startLoadingSectionData(state) {
      state.isLoadingSectionData = true;
    },
    finishLoadingSectionData(state) {
      state.isLoadingSectionData = false;
    },
    setStudentsForCurrentSection: {
      reducer(
        state,
        action: PayloadAction<{
          sectionId: number;
          students: ServerStudent[];
        }>
      ) {
        const students = action.payload.students || [];
        const selectedStudents = students.map(
          student =>
            studentFromServerStudent(
              student,
              action.payload.sectionId
            ) as Student
        );

        state.selectedStudents = selectedStudents;
      },
      prepare(sectionId: number, students: ServerStudent[]) {
        return {
          payload: {
            sectionId,
            students,
          },
        };
      },
    },
    setRosterProviderName(state, action: PayloadAction<string>) {
      state.rosterProviderName = action.payload;
    },
    updateSectionAiTutorEnabled(
      state,
      action: PayloadAction<{
        sectionId: number;
        aiTutorEnabled: boolean;
      }>
    ) {
      const {sectionId, aiTutorEnabled} = action.payload;

      state.sections[sectionId].aiTutorEnabled = aiTutorEnabled;
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
    setSectionCodeReviewExpiresAt: {
      reducer(
        state,
        action: PayloadAction<{
          sectionId: number;
          codeReviewExpiresAt: string;
        }>
      ) {
        const section = state.sections[action.payload.sectionId];
        if (!section) {
          throw new Error('section does not exist');
        }

        state.sections[action.payload.sectionId].codeReviewExpiresAt = action
          .payload.codeReviewExpiresAt
          ? Date.parse(action.payload.codeReviewExpiresAt)
          : null;
      },
      prepare(sectionId: number, codeReviewExpiresAt: string) {
        return {
          payload: {
            sectionId,
            codeReviewExpiresAt,
          },
        };
      },
    },
    removeSection(state, action: PayloadAction<number>) {
      const sectionId = action.payload;
      const section = state.sections[sectionId];
      if (!section) {
      }
      state.sectionIds = _.without(state.sectionIds, sectionId);
      state.studentSectionIds = _.without(state.studentSectionIds, sectionId);
      state.plSectionIds = _.without(state.plSectionIds, sectionId);
      state.sections = _.omit(state.sections, sectionId);
    },
    beginCreatingSection: {
      reducer(
        state,
        action: PayloadAction<{
          courseOfferingId?: number | null;
          courseVersionId?: number | null;
          unitId?: number | null;
          participantType?: string;
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
        state.initialUnitName = initialSectionData.unitName;
        state.sectionBeingEdited = initialSectionData;
      },
      prepare(
        courseOfferingId?: number,
        courseVersionId?: number,
        unitId?: number,
        participantType?: string
      ) {
        return {
          payload: {
            courseOfferingId,
            courseVersionId,
            unitId,
            participantType,
          },
        };
      },
    },
    beginEditingSection: {
      reducer(
        state,
        action: PayloadAction<{sectionId?: number; silent: boolean}>
      ) {
        const silent = !!action.payload.silent;
        const initialParticipantType =
          state.availableParticipantTypes.length === 1
            ? state.availableParticipantTypes[0]
            : undefined;
        const initialSectionData: Section = action.payload.sectionId
          ? {...state.sections[action.payload.sectionId]}
          : newSectionData(initialParticipantType);
        state.initialCourseId = initialSectionData.courseId;
        state.initialUnitId = initialSectionData.unitId;
        state.initialCourseOfferingId = initialSectionData.courseOfferingId;
        state.initialCourseVersionId = initialSectionData.courseVersionId;
        state.initialLoginType = initialSectionData.loginType;
        state.sectionBeingEdited = initialSectionData;
        state.showSectionEditDialog = !silent;
      },
      prepare(sectionId = null, silent = false) {
        return {
          payload: {
            sectionId,
            silent,
          },
        };
      },
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
    startSaveRequest(state) {
      state.saveInProgress = true;
    },
    finishSaveRequest(
      state,
      action: PayloadAction<{
        sectionId: number;
        serverSection: ServerSection;
      }>
    ) {
      // When updating a persisted section, oldSectionId will be identical to
      // section.id. However, if this is a newly persisted section, oldSectionId
      // will represent our temporary section. In that case, we want to delete
      // that section, and replace it with our new one.
      const section = sectionFromServerSection(action.payload.serverSection);
      const oldSectionId = action.payload.sectionId;
      const isNewSection = section.id !== oldSectionId;

      if (isNewSection) {
        if (state.sectionIds.includes(oldSectionId)) {
          state.sectionIds = state.sectionIds.map(id =>
            id === oldSectionId ? section.id : id
          );
        } else {
          state.sectionIds = [section.id, ...state.sectionIds];
        }
      }

      delete state.sections[oldSectionId];
      state.sections[section.id] = {...state.sections[section.id], ...section};

      state.studentSectionIds = Object.values(state.sections)
        .filter(
          section => section.participantType === ParticipantAudience.student
        )
        .map(section => section.id);
      state.plSectionIds = Object.values(state.sections)
        .filter(
          section => section.participantType !== ParticipantAudience.student
        )
        .map(section => section.id);

      if (section.loginType !== state.initialLoginType) {
        firehoseClient.putRecord(
          {
            study: 'teacher-dashboard',
            study_group: 'edit-section-details',
            event: 'change-login-type',
            data_json: JSON.stringify({
              sectionId: section.id,
              initialLoginType: state.initialLoginType,
              updatedLoginType: section.loginType,
            }),
          },
          {includeUserId: true}
        );
      }

      const assignmentData: AssignmentData = {
        section_id: section.id,
        section_creation_timestamp: section.createdAt,
        page_name: state.pageType,
      };
      if (section.unitId !== state.initialUnitId) {
        assignmentData.unit_id = section.unitId;
      }
      if (section.courseId !== state.initialCourseId) {
        assignmentData.course_id = section.courseId;
      }
      if (section.courseOfferingId !== state.initialCourseOfferingId) {
        assignmentData.course_offering_id = section.courseOfferingId;
      }
      if (section.courseVersionId !== state.initialCourseVersionId) {
        assignmentData.course_version_id = section.courseVersionId;
      }
      if (section.unitName !== state.initialUnitName) {
        assignmentData.unitName = section.unitName;
      }
      // If either of these has been set, assignment changed and should be logged
      if (assignmentData.unit_id || assignmentData.course_id) {
        firehoseClient.putRecord(
          {
            study: 'assignment',
            study_group: 'v1',
            event: isNewSection ? 'create_section' : 'edit_section_details',
            data_json: JSON.stringify(assignmentData),
          },
          {includeUserId: true}
        );
      }

      state.sectionBeingEdited = null;
      state.saveInProgress = false;
    },
    failSaveRequest(state) {
      state.saveInProgress = false;
    },
    beginAsyncLoad(state) {
      state.asyncLoadComplete = false;
    },
    endAsyncLoad(state) {
      state.asyncLoadComplete = true;
    },
    cancelEditingSection(state) {
      state.sectionBeingEdited = null;
    },
    setCoteacherInvite(
      state,
      action: PayloadAction<SectionInstructor | undefined>
    ) {
      state.coteacherInvite = action.payload;
    },
    setCoteacherInviteForPl(
      state,
      action: PayloadAction<SectionInstructor | undefined>
    ) {
      state.coteacherInviteForPl = action.payload;
    },
    beginImportRosterFlow(state) {
      state.isRosterDialogOpen = true;
      state.classrooms = null;
    },
    importRosterFlowListLoaded(state, action: PayloadAction<Classroom[]>) {
      state.classrooms = action.payload;
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
    rosterImportRequest(state) {
      state.classrooms = null;
    },
    rosterImportSuccess(state, action: PayloadAction<number>) {
      state.isRosterDialogOpen = false;
      state.sectionBeingEdited = {
        ...state.sections[action.payload],
        // explicitly unhide after importing
        hidden: false,
      };
    },
    ltiRosterImportSuccess(state, action: PayloadAction<LtiSectionSyncResult>) {
      state.ltiSyncResult = action.payload;
    },
  },
});

/** @const A few constants exposed for unit test setup */
export const __testInterface__ = {
  EDIT_SECTION_REQUEST: 'teacherSections/startSaveRequest',
  EDIT_SECTION_SUCCESS: 'teacherSections/finishSaveRequest',
  IMPORT_ROSTER_FLOW_BEGIN: 'teacherSections/beginImportRosterFlow',
  IMPORT_ROSTER_FLOW_LIST_LOADED: 'teacherSections/importRosterFlowListLoaded',
  PENDING_NEW_SECTION_ID: -1,
  USER_EDITABLE_SECTION_PROPS,
};

//Thunks
type SectionThunkAction = ThunkAction<void, RootState, undefined, AnyAction>;

/**
 * Changes the hidden state of a given section, persisting these changes to the
 * server
 * @param {number} sectionId
 */
export const toggleSectionHidden =
  (sectionId: number): SectionThunkAction =>
  (dispatch, getState) => {
    dispatch(beginEditingSection(sectionId, true));
    const state = getState().teacherSections;
    const currentlyHidden = state.sections[sectionId].hidden;
    dispatch(editSectionProperties({hidden: !currentlyHidden}));

    // Track archive/restore section action
    firehoseClient.putRecord({
      study: 'teacher_dashboard_actions',
      study_group: 'toggleSectionHidden',
      event: currentlyHidden ? 'restoreSection' : 'archiveSection',
      data_json: JSON.stringify({
        section_id: sectionId,
      }),
    });
    return dispatch(finishEditingSection());
  };

const submitEditingSection = (
  dispatch: ThunkDispatch<
    {teacherSections: TeacherSectionState},
    undefined,
    AnyAction
  >,
  getState: () => RootState
) => {
  dispatch(startSaveRequest());
  const state = getState().teacherSections;
  const section = state.sectionBeingEdited;

  if (!section) {
    throw new Error('section does not exist');
  }

  if (isAddingSection(state)) {
    return $.ajax({
      url: '/dashboardapi/sections',
      method: 'POST',
      contentType: 'application/json;charset=UTF-8',
      data: JSON.stringify(serverSectionFromSection(section)),
    });
  } else {
    return $.ajax({
      url: `/dashboardapi/sections/${section.id}`,
      method: 'PATCH',
      contentType: 'application/json;charset=UTF-8',
      data: JSON.stringify(serverSectionFromSection(section)),
    });
  }
};

/**
 * Submit staged section changes to the server.
 * Closes UI and updates section table on success.
 */
export const finishEditingSection =
  (): SectionThunkAction => (dispatch, getState) => {
    const state = getState().teacherSections;
    const section = state.sectionBeingEdited;

    if (!section) {
      throw new Error('section does not exist');
    }

    return new Promise((resolve, reject) => {
      submitEditingSection(dispatch, getState)
        .done(result => {
          dispatch(
            finishSaveRequest({
              sectionId: section.id,
              serverSection: result,
            })
          );
          resolve(result);
        })
        .fail((jqXhr: object, status: string) => {
          dispatch(failSaveRequest());
          reject(status);
        });
    });
  };

/**
 * Removes a section or throws an error if the section does not exist.
 */
export const removeSectionOrThrow =
  (sectionId: number): SectionThunkAction =>
  (dispatch, getState) => {
    const state = getState().teacherSections;

    if (state.sections[sectionId]) {
      dispatch(removeSection(sectionId));
    } else {
      throw new Error('section does not exist');
    }
  };

type ParticipantTypesResponse = {
  availableParticipantTypes: string[];
};

export const asyncLoadSectionData =
  (id: number | void): SectionThunkAction =>
  dispatch => {
    dispatch(beginAsyncLoad());

    const promises: Promise<object>[] = [
      fetchJSON('/dashboardapi/sections').then(sections =>
        dispatch(setSections(sections as ServerSection[]))
      ),
      fetchJSON('/dashboardapi/sections/valid_course_offerings').then(
        offerings =>
          dispatch(setCourseOfferings(offerings as AssignmentCourseOffering[]))
      ),
      fetchJSON('/dashboardapi/sections/available_participant_types').then(
        participantTypes =>
          dispatch(
            setAvailableParticipantTypes(
              (participantTypes as ParticipantTypesResponse)
                .availableParticipantTypes
            )
          )
      ),
    ];

    // If section id is provided, load students for the current section.
    if (id) {
      promises.push(
        fetchJSON(`/dashboardapi/sections/${id}/students`).then(students =>
          dispatch(
            setStudentsForCurrentSection(id, students as ServerStudent[])
          )
        )
      );
    }

    return Promise.all(promises)
      .catch(err => {
        console.error(err.message);
      })
      .then(() => {
        dispatch(endAsyncLoad());
      });
  };

function fetchJSON(url: string, params?: object) {
  return new Promise((resolve, reject) => {
    $.getJSON(url, params)
      .done(resolve)
      .fail(jqxhr =>
        reject(
          new Error(`
        url: ${url}
        status: ${jqxhr.status}
        statusText: ${jqxhr.statusText}
        responseText: ${jqxhr.responseText}
      `)
        )
      );
  });
}

export const asyncLoadCoteacherInvite = (): SectionThunkAction => dispatch => {
  fetchJSON('/api/v1/section_instructors')
    .then(response => {
      const sectionInstructors = response as SectionInstructor[];
      const coteacherInviteForPl = sectionInstructors.find(instructorInvite => {
        return (
          instructorInvite.status === 'invited' &&
          instructorInvite.participant_type !== 'student'
        );
      });
      const coteacherInviteForClassrooms = sectionInstructors.find(
        instructorInvite => {
          return (
            instructorInvite.status === 'invited' &&
            instructorInvite.participant_type === 'student'
          );
        }
      );

      dispatch(setCoteacherInvite(coteacherInviteForClassrooms));
      dispatch(setCoteacherInviteForPl(coteacherInviteForPl));
    })
    .catch(err => {
      console.error(err.message);
    });
};

/**
 * Assigns a course to a given section, persisting these changes to
 * the server
 * @param {number} sectionId
 * @param {number} courseId
 * @param {number} courseOfferingId
 * @param {number} courseVersionId
 * @param {number} unitId
 * @param {string} pageType
 */
export const assignToSection = (
  sectionId: number,
  courseId: number,
  courseOfferingId: number,
  courseVersionId: number,
  unitId: number,
  pageType: string
): SectionThunkAction => {
  firehoseClient.putRecord(
    {
      study: 'assignment',
      event: 'course-assigned-to-section',
      data_json: JSON.stringify(
        {
          sectionId,
          unitId,
          courseId,
          date: new Date(),
        },
        removeNullValues
      ),
    },
    {includeUserId: true}
  );
  return (dispatch, getState) => {
    const section = getState().teacherSections.sections[sectionId];
    // Only log if the assignment is changing.
    // We need an OR here because unitId will be null for standalone units
    if (
      (courseOfferingId && section.courseOfferingId !== courseOfferingId) ||
      (courseVersionId && section.courseVersionId !== courseVersionId) ||
      (unitId && section.unitId !== unitId)
    ) {
      analyticsReporter.sendEvent(
        EVENTS.CURRICULUM_ASSIGNED,
        {
          sectionName: section.name,
          sectionId,
          sectionLoginType: section.loginType,
          previousUnitId: section.unitId,
          previousCourseId: section.courseOfferingId,
          previousCourseVersionId: section.courseVersionId,
          newUnitId: unitId,
          newCourseId: courseOfferingId,
          newCourseVersionId: courseVersionId,
        },
        PLATFORMS.BOTH
      );
    }

    dispatch(beginEditingSection(sectionId, true));
    dispatch(
      editSectionProperties({
        courseId: courseId,
        courseOfferingId: courseOfferingId,
        courseVersionId: courseVersionId,
        unitId: unitId,
      })
    );
    return dispatch(finishEditingSection());
  };
};

/**
 * Removes assignments from the given section, persisting these changes to
 * the server
 * @param {number} sectionId
 */
export const unassignSection =
  (sectionId: number, location: string): SectionThunkAction =>
  (dispatch, getState) => {
    dispatch(beginEditingSection(sectionId, true));
    const {initialCourseId, initialUnitId} = getState().teacherSections;

    dispatch(
      editSectionProperties({
        courseId: null,
        courseOfferingId: null,
        courseVersionId: null,
        unitId: null,
      })
    );
    firehoseClient.putRecord(
      {
        study: 'assignment',
        event: 'course-unassigned-from-section',
        data_json: JSON.stringify(
          {
            sectionId,
            scriptId: initialUnitId,
            courseId: initialCourseId,
            location: location,
            date: new Date(),
          },
          removeNullValues
        ),
      },
      {includeUserId: true}
    );
    return dispatch(finishEditingSection());
  };

/**
 * Removes null values from stringified object before sending firehose record
 */
function removeNullValues(key: string, val?: string | number | null) {
  if (val === null || typeof val === 'undefined') {
    return undefined;
  }
  return val;
}

/** @const {Object} Map oauth section type to relative "list rosters" URL. */
const urlByProvider: {[key: string]: string} = {
  [OAuthSectionTypes.google_classroom]: '/dashboardapi/google_classrooms',
  [OAuthSectionTypes.clever]: '/dashboardapi/clever_classrooms',
} as const;

/**
 * Start the process of importing a section from a third-party provider
 * (like Google Classroom or Clever) by opening the RosterDialog and
 * loading the list of classrooms available for import.
 */
export const beginImportRosterFlow =
  (): SectionThunkAction => (dispatch, getState) => {
    const state = getState().teacherSections;
    const provider = state.rosterProvider;
    if (!provider || !Object.keys(urlByProvider).includes(provider)) {
      return Promise.reject(
        new Error('Unable to begin import roster flow without a provider')
      );
    }

    if (state.isRosterDialogOpen) {
      return Promise.resolve();
    }

    dispatch(sectionSlice.actions.beginImportRosterFlow());
    return new Promise<void>((resolve, reject) => {
      const url = urlByProvider[provider] as string;
      $.ajax(url)
        .done(response => {
          dispatch(importRosterFlowListLoaded(response.courses || []));
          resolve();
        })
        .fail(result => {
          const message = result.responseJSON
            ? result.responseJSON.error
            : 'Unknown error.';
          dispatch(rosterImportFailed({status: result.status, message}));
          reject(new Error(message));
        });
    });
  };

/** @const {Object} Map oauth section type to relative import URL. */
const importUrlByProvider: {[key: string]: string} = {
  [OAuthSectionTypes.google_classroom]: '/dashboardapi/import_google_classroom',
  [OAuthSectionTypes.clever]: '/dashboardapi/import_clever_classroom',
  [SectionLoginType.lti_v1]: '/lti/v1/sync_course',
} as const;

/**
 * Import the course with the given courseId from a third-party provider
 * (like Google Classroom or Clever), creating a new section. If the course
 * in question has already been imported, update the existing section already
 * associated with it.
 * @param {string} courseId
 * @param {string} courseName
 * @return {function():Promise}
 */
export const importOrUpdateRoster =
  (courseId: string, courseName: string): SectionThunkAction =>
  (dispatch, getState) => {
    const state = getState();
    const provider = state.teacherSections.rosterProvider;

    if (!provider) {
      throw new Error('Roster provider has not been set.');
    }

    const importSectionUrl = importUrlByProvider[provider];

    dispatch(rosterImportRequest());
    if (provider === SectionLoginType.lti_v1) {
      return fetch(`${importSectionUrl}?section_code=${courseId}`, {
        headers: {
          Accept: 'application/json',
        },
      })
        .then(response => {
          return response.json();
        })
        .then(results => {
          return dispatch(ltiRosterImportSuccess(results));
        });
    }
    let sectionId: number;
    return fetchJSON(importSectionUrl, {courseId, courseName})
      .then(newSection => (sectionId = (newSection as ServerSection).id))
      .then(() => dispatch(asyncLoadSectionData()))
      .then(() => dispatch(rosterImportSuccess(sectionId)));
  };

// pageType describes the current route the user is on. Used only for logging.
// Enum of allowed values:
export const pageTypes = {
  level: 'level',
  scriptOverview: 'script_overview',
  courseOverview: 'course_overview',
  lessonExtras: 'lesson_extras',
  homepage: 'homepage',
} as const;

// Actions used only by thunks within this file don't need to be exported.
const {
  beginAsyncLoad,
  endAsyncLoad,
  failSaveRequest,
  finishSaveRequest,
  importRosterFlowListLoaded,
  ltiRosterImportSuccess,
  rosterImportRequest,
  rosterImportSuccess,
  setAvailableParticipantTypes,
  startSaveRequest,
} = sectionSlice.actions;

export const {
  beginCreatingSection,
  beginEditingSection,
  cancelEditingSection,
  cancelImportRosterFlow,
  editSectionProperties,
  finishLoadingSectionData,
  removeSection,
  rosterImportFailed,
  selectSection,
  setAuthProviders,
  setCoteacherInvite,
  setCoteacherInviteForPl,
  setCourseOfferings,
  setPageType,
  setRosterProvider,
  setRosterProviderName,
  setSectionCodeReviewExpiresAt,
  setSections,
  setStudentsForCurrentSection,
  startLoadingSectionData,
  updateSectionAiTutorEnabled,
  updateSelectedSection,
} = sectionSlice.actions;

export default sectionSlice.reducer;
