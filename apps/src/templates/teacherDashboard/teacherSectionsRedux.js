import $ from 'jquery';
import _ from 'lodash';
import PropTypes from 'prop-types';

import {ParticipantAudience} from '@cdo/apps/generated/curriculum/sharedCourseConstants';
import {OAuthSectionTypes} from '@cdo/apps/lib/ui/accounts/constants';
import {EVENTS, PLATFORMS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import harness from '@cdo/apps/lib/util/harness';
import {
  SectionLoginType,
  PlGradeValue,
} from '@cdo/generated-scripts/sharedConstants';

/**
 * @const {string[]} The only properties that can be updated by the user
 * when creating or editing a section.
 */
const USER_EDITABLE_SECTION_PROPS = [
  'name',
  'loginType',
  'lessonExtras',
  'pairingAllowed',
  'ttsAutoplayEnabled',
  'participantType',
  'courseId',
  'courseOfferingId',
  'courseVersionId',
  'unitId',
  'grades',
  'hidden',
  'restrictSection',
  'codeReviewExpiresAt',
  'aiTutorEnabled',
];

/** @const {number} ID for a new section that has not been saved */
const PENDING_NEW_SECTION_ID = -1;

/** @const {null} null used to indicate no section selected */
export const NO_SECTION = null;

/** @const {Object} Map oauth section type to relative "list rosters" URL. */
const urlByProvider = {
  [OAuthSectionTypes.google_classroom]: '/dashboardapi/google_classrooms',
  [OAuthSectionTypes.clever]: '/dashboardapi/clever_classrooms',
};

/** @const {Object} Map oauth section type to relative import URL. */
const importUrlByProvider = {
  [OAuthSectionTypes.google_classroom]: '/dashboardapi/import_google_classroom',
  [OAuthSectionTypes.clever]: '/dashboardapi/import_clever_classroom',
  [SectionLoginType.lti_v1]: '/lti/v1/sync_course',
};

//
// Action keys
//
const SET_COURSE_OFFERINGS = 'teacherDashboard/SET_COURSE_OFFERINGS';
const SET_AVAILABLE_PARTICIPANT_TYPES =
  'teacherDashboard/SET_AVAILABLE_PARTICIPANT_TYPES';
const SET_STUDENT_SECTION = 'teacherDashboard/SET_STUDENT_SECTION';
const SET_PAGE_TYPE = 'teacherDashboard/SET_PAGE_TYPE';

// DCDO Flag - show/hide Lock Section field
const SET_SHOW_LOCK_SECTION_FIELD =
  'teacherDashboard/SET_SHOW_LOCK_SECTION_FIELD';

/** Sets teacher's current authentication providers */
const SET_AUTH_PROVIDERS = 'teacherDashboard/SET_AUTH_PROVIDERS';
const SET_SECTIONS = 'teacherDashboard/SET_SECTIONS';
const SET_COTEACHER_INVITE = 'teacherDashboard/SET_COTEACHER_INVITE';
const SET_COTEACHER_INVITE_FOR_PL =
  'teacherDashboard/SET_COTEACHER_INVITE_FOR_PL';
export const SELECT_SECTION = 'teacherDashboard/SELECT_SECTION';
const REMOVE_SECTION = 'teacherDashboard/REMOVE_SECTION';
const TOGGLE_SECTION_HIDDEN = 'teacherSections/TOGGLE_SECTION_HIDDEN';
/** Opens add section UI */
const CREATE_SECTION_BEGIN = 'teacherDashboard/CREATE_SECTION_BEGIN';
/** Opens section edit UI, might load existing section info */
const EDIT_SECTION_BEGIN = 'teacherDashboard/EDIT_SECTION_BEGIN';
/** Makes staged changes to section being edited */
const EDIT_SECTION_PROPERTIES = 'teacherDashboard/EDIT_SECTION_PROPERTIES';
/** Abandons changes to section being edited, closes UI */
const EDIT_SECTION_CANCEL = 'teacherDashboard/EDIT_SECTION_CANCEL';
/** Reports server request has started */
const EDIT_SECTION_REQUEST = 'teacherDashboard/EDIT_SECTION_REQUEST';
/** Reports server request has succeeded */
const EDIT_SECTION_SUCCESS = 'teacherDashboard/EDIT_SECTION_SUCCESS';
/** Reports server request has failed */
const EDIT_SECTION_FAILURE = 'teacherDashboard/EDIT_SECTION_FAILURE';
/** Sets section codeReviewExpiresAt after it's been updated */
const SET_SECTION_CODE_REVIEW_EXPIRES_AT =
  'teacherSections/SET_SECTION_CODE_REVIEW_EXPIRES_AT';

const ASYNC_LOAD_BEGIN = 'teacherSections/ASYNC_LOAD_BEGIN';
const ASYNC_LOAD_END = 'teacherSections/ASYNC_LOAD_END';

/** Sets a section's roster provider, which must be of type OAuthSectionTypes */
const SET_ROSTER_PROVIDER = 'teacherSections/SET_ROSTER_PROVIDER';
/** Sets a section's roster provider name which should be shown to users */
const SET_ROSTER_PROVIDER_NAME = 'teacherSections/SET_ROSTER_PROVIDER_NAME';
/** Opens the third-party roster UI */
const IMPORT_ROSTER_FLOW_BEGIN = 'teacherSections/IMPORT_ROSTER_FLOW_BEGIN';
/** Reports available rosters have been loaded */
const IMPORT_ROSTER_FLOW_LIST_LOADED =
  'teacherSections/IMPORT_ROSTER_FLOW_LIST_LOADED';
/** Reports loading available rosters has failed */
const IMPORT_ROSTER_FLOW_LIST_LOAD_FAILED =
  'teacherSections/IMPORT_ROSTER_FLOW_LIST_LOAD_FAILED';
/** Closes the third-party roster UI, purging available rosters */
const IMPORT_ROSTER_FLOW_CANCEL = 'teacherSections/IMPORT_ROSTER_FLOW_CANCEL';
/** Reports request to import a roster has started */
const IMPORT_ROSTER_REQUEST = 'teacherSections/IMPORT_ROSTER_REQUEST';
/** Reports request to import a roster has succeeded */
const IMPORT_ROSTER_SUCCESS = 'teacherSections/IMPORT_ROSTER_SUCCESS';
const IMPORT_LTI_ROSTER_SUCCESS = 'teacherSections/IMPORT_LTI_ROSTER_SUCCESS';
/** Sets section aiTutorEnabled */
const UPDATE_SECTION_AI_TUTOR_ENABLED =
  'teacherSections/UPDATE_SECTION_AI_TUTOR_ENABLED';

/** @const A few constants exposed for unit test setup */
export const __testInterface__ = {
  EDIT_SECTION_REQUEST,
  EDIT_SECTION_SUCCESS,
  IMPORT_ROSTER_FLOW_BEGIN,
  IMPORT_ROSTER_FLOW_LIST_LOADED,
  PENDING_NEW_SECTION_ID,
  USER_EDITABLE_SECTION_PROPS,
};

//
// Action Creators
//
export const setAuthProviders = providers => ({
  type: SET_AUTH_PROVIDERS,
  providers,
});
export const setRosterProvider = rosterProvider => ({
  type: SET_ROSTER_PROVIDER,
  rosterProvider,
});
export const setRosterProviderName = rosterProviderName => ({
  type: SET_ROSTER_PROVIDER_NAME,
  rosterProviderName,
});
export const setCourseOfferings = courseOfferings => ({
  type: SET_COURSE_OFFERINGS,
  courseOfferings,
});
export const setAvailableParticipantTypes = availableParticipantTypes => ({
  type: SET_AVAILABLE_PARTICIPANT_TYPES,
  availableParticipantTypes,
});
export const setStudentsForCurrentSection = (sectionId, studentInfo) => ({
  type: SET_STUDENT_SECTION,
  sectionId: sectionId,
  students: studentInfo,
});
export const setPageType = pageType => ({type: SET_PAGE_TYPE, pageType});

// DCDO Flag - show/hide Lock Section field
export const setShowLockSectionField = showLockSectionField => {
  return {
    type: SET_SHOW_LOCK_SECTION_FIELD,
    showLockSectionField,
  };
};
export const setSectionCodeReviewExpiresAt = (
  sectionId,
  codeReviewExpiresAt
) => {
  return {
    type: SET_SECTION_CODE_REVIEW_EXPIRES_AT,
    sectionId,
    codeReviewExpiresAt,
  };
};

export const updateSectionAiTutorEnabled = (sectionId, aiTutorEnabled) => {
  return {
    type: UPDATE_SECTION_AI_TUTOR_ENABLED,
    sectionId,
    aiTutorEnabled,
  };
};

// pageType describes the current route the user is on. Used only for logging.
// Enum of allowed values:
export const pageTypes = {
  level: 'level',
  scriptOverview: 'script_overview',
  courseOverview: 'course_overview',
  lessonExtras: 'lesson_extras',
  homepage: 'homepage',
};

/**
 * Set the list of sections to display.
 * @param sections
 */
export const setSections = sections => ({type: SET_SECTIONS, sections});
export const selectSection = sectionId => ({type: SELECT_SECTION, sectionId});
export const removeSection = sectionId => ({type: REMOVE_SECTION, sectionId});

/**
 * Changes the hidden state of a given section, persisting these changes to the
 * server
 * @param {number} sectionId
 */
export const toggleSectionHidden = sectionId => (dispatch, getState) => {
  dispatch(beginEditingSection(sectionId, true));
  const state = getState();
  const currentlyHidden = getRoot(state).sections[sectionId].hidden;
  dispatch(editSectionProperties({hidden: !currentlyHidden}));

  // Track archive/restore section action
  harness.trackAnalytics({
    study: 'teacher_dashboard_actions',
    study_group: 'toggleSectionHidden',
    event: currentlyHidden ? 'restoreSection' : 'archiveSection',
    data_json: JSON.stringify({
      section_id: sectionId,
    }),
  });
  return dispatch(finishEditingSection());
};

/**
 * Removes null values from stringified object before sending firehose record
 */
function removeNullValues(key, val) {
  if (val === null || typeof val === 'undefined') {
    return undefined;
  }
  return val;
}

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
  sectionId,
  courseId,
  courseOfferingId,
  courseVersionId,
  unitId,
  pageType
) => {
  harness.trackAnalytics(
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
    return dispatch(finishEditingSection(pageType));
  };
};

/**
 * Removes assignments from the given section, persisting these changes to
 * the server
 * @param {number} sectionId
 */
export const unassignSection =
  (sectionId, location) => (dispatch, getState) => {
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
    harness.trackAnalytics(
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

export const beginCreatingSection = (
  courseOfferingId,
  courseVersionId,
  unitId,
  participantType
) => ({
  type: CREATE_SECTION_BEGIN,
  courseOfferingId,
  courseVersionId,
  unitId,
  participantType,
});

/**
 * Opens the UI for editing the specified section.
 * @param {number} sectionId - Optional param for the id of the section to edit. If blank means
 * new section
 * @param {bool} [silent] - Optional param for when we want to begin editing the
 *   section without launching our dialog
 */
export const beginEditingSection = (sectionId = null, silent = false) => ({
  type: EDIT_SECTION_BEGIN,
  sectionId,
  silent,
});

/**
 * Make staged changes to the section currently being edited.
 * @param {object} props - set of section properties of update.
 * @throws if not currently editing, or if trying to set an invalid prop.
 */
export const editSectionProperties = props => ({
  type: EDIT_SECTION_PROPERTIES,
  props,
});

/**
 * Close the UI for adding/editing a section, abandoning changes.
 */
export const cancelEditingSection = () => ({type: EDIT_SECTION_CANCEL});

export const submitEditingSection = (dispatch, getState) => {
  dispatch({type: EDIT_SECTION_REQUEST});
  const state = getState().teacherSections;
  const section = state.sectionBeingEdited;

  const dataUrl = isAddingSection(state)
    ? '/dashboardapi/sections'
    : `/dashboardapi/sections/${section.id}`;
  const httpMethod = isAddingSection(state) ? 'POST' : 'PATCH';
  return $.ajax({
    url: dataUrl,
    method: httpMethod,
    contentType: 'application/json;charset=UTF-8',
    data: JSON.stringify(serverSectionFromSection(section)),
  });
};

/**
 * Submit staged section changes to the server.
 * Closes UI and updates section table on success.
 */
export const finishEditingSection = () => (dispatch, getState) => {
  const state = getState().teacherSections;
  const section = state.sectionBeingEdited;
  return new Promise((resolve, reject) => {
    submitEditingSection(dispatch, getState)
      .done(result => {
        dispatch({
          type: EDIT_SECTION_SUCCESS,
          sectionId: section.id,
          serverSection: result,
        });
        resolve(result);
      })
      .fail((jqXhr, status) => {
        dispatch({type: EDIT_SECTION_FAILURE});
        reject(status);
      });
  });
};

export const asyncLoadSectionData = id => dispatch => {
  dispatch({type: ASYNC_LOAD_BEGIN});

  const promises = [
    fetchJSON('/dashboardapi/sections').then(sections =>
      dispatch(setSections(sections))
    ),
    fetchJSON('/dashboardapi/sections/valid_course_offerings').then(offerings =>
      dispatch(setCourseOfferings(offerings))
    ),
    fetchJSON('/dashboardapi/sections/available_participant_types').then(
      participantTypes =>
        dispatch(
          setAvailableParticipantTypes(
            participantTypes.availableParticipantTypes
          )
        )
    ),
  ];

  // If section id is provided, load students for the current section.
  if (id) {
    promises.push(
      fetchJSON(`/dashboardapi/sections/${id}/students`).then(students =>
        dispatch(setStudentsForCurrentSection(id, students))
      )
    );
  }

  return Promise.all(promises)
    .catch(err => {
      console.error(err.message);
    })
    .then(() => {
      dispatch({type: ASYNC_LOAD_END});
    });
};

/**
 * Load coteacher invites
 */

export const setCoteacherInvite = coteacherInvite => ({
  type: SET_COTEACHER_INVITE,
  coteacherInvite,
});

export const setCoteacherInviteForPl = coteacherInviteForPl => ({
  type: SET_COTEACHER_INVITE_FOR_PL,
  coteacherInviteForPl,
});

export const asyncLoadCoteacherInvite = () => dispatch => {
  fetchJSON('/api/v1/section_instructors')
    .then(sectionInstructors => {
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

function fetchJSON(url, params) {
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

/**
 * Start the process of importing a section from a third-party provider
 * (like Google Classroom or Clever) by opening the RosterDialog and
 * loading the list of classrooms available for import.
 */
export const beginImportRosterFlow = () => (dispatch, getState) => {
  const state = getState();
  const provider = getRoot(state).rosterProvider;
  if (!provider) {
    return Promise.reject(
      new Error('Unable to begin import roster flow without a provider')
    );
  }

  if (isRosterDialogOpen(state)) {
    return Promise.resolve();
  }

  dispatch({type: IMPORT_ROSTER_FLOW_BEGIN});
  return new Promise((resolve, reject) => {
    $.ajax(urlByProvider[provider])
      .success(response => {
        dispatch({
          type: IMPORT_ROSTER_FLOW_LIST_LOADED,
          classrooms: response.courses || [],
        });
        resolve();
      })
      .fail(result => {
        const message = result.responseJSON
          ? result.responseJSON.error
          : 'Unknown error.';
        dispatch({
          type: IMPORT_ROSTER_FLOW_LIST_LOAD_FAILED,
          status: result.status,
          message,
        });
        reject(new Error(message));
      });
  });
};

/** Abandon the import process, closing the RosterDialog. */
export const cancelImportRosterFlow = () => ({type: IMPORT_ROSTER_FLOW_CANCEL});

/**
 * Start the process of importing a section from Google Classroom by opening
 * the RosterDialog and loading the list of classrooms available for import.
 */
export const beginGoogleImportRosterFlow = () => dispatch => {
  dispatch(setRosterProvider(OAuthSectionTypes.google_classroom));
  dispatch(beginImportRosterFlow());
};

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
  (courseId, courseName) => (dispatch, getState) => {
    const state = getState();
    const provider = getRoot(state).rosterProvider;
    const importSectionUrl = importUrlByProvider[provider];
    let sectionId;

    dispatch({type: IMPORT_ROSTER_REQUEST});
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
          return dispatch({
            type: IMPORT_LTI_ROSTER_SUCCESS,
            sectionId: sectionId,
            results: results,
          });
        });
    }
    return fetchJSON(importSectionUrl, {courseId, courseName})
      .then(newSection => (sectionId = newSection.id))
      .then(() => dispatch(asyncLoadSectionData()))
      .then(() =>
        dispatch({
          type: IMPORT_ROSTER_SUCCESS,
          sectionId,
        })
      );
  };

/**
 * Initial state of this redux module.
 * Should represent the overall state shape with reasonable default values.
 */
const initialState = {
  nextTempId: -1,
  studioUrl: '',
  // List of teacher's authentication providers (mapped to OAuthSectionTypes
  // for consistency and ease of comparison).
  providers: [],
  sectionIds: [],
  studentSectionIds: [],
  plSectionIds: [],
  selectedSectionId: NO_SECTION,
  // Array of course offerings, to populate the assignment dropdown
  // with options like "CSD", "Course A", or "Frozen". See the
  // assignmentCourseOfferingShape PropType.
  courseOfferings: {},
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
};
/**
 * Generate shape for new section
 * @param participantType
 * @returns {sectionShape}
 */

function newSectionData(participantType) {
  return {
    id: PENDING_NEW_SECTION_ID,
    name: '',
    loginType: undefined,
    grades: [''],
    providerManaged: false,
    lessonExtras: true,
    pairingAllowed: true,
    ttsAutoplayEnabled: false,
    sharingDisabled: false,
    studentCount: 0,
    participantType: participantType,
    code: '',
    courseId: null,
    courseOfferingId: null,
    courseVersionId: null,
    courseDisplayName: null,
    unitId: null,
    hidden: false,
    restrictSection: false,
    aiTutorEnabled: false,
  };
}

// Maps authentication provider to OAuthSectionTypes for ease of comparison
// (i.e., Google auth is 'google_oauth2' but the section type is 'google_classroom').
export const mapProviderToSectionType = provider => {
  switch (provider) {
    case 'google_oauth2':
      return OAuthSectionTypes.google_classroom;
    default:
      return provider;
  }
};

export default function teacherSections(state = initialState, action) {
  if (action.type === SET_AUTH_PROVIDERS) {
    return {
      ...state,
      providers: action.providers.map(provider =>
        mapProviderToSectionType(provider)
      ),
    };
  }

  if (action.type === SET_PAGE_TYPE) {
    return {
      ...state,
      pageType: action.pageType,
    };
  }

  if (action.type === SET_COURSE_OFFERINGS) {
    return {
      ...state,
      courseOfferings: action.courseOfferings,
      courseOfferingsAreLoaded: true,
    };
  }

  if (action.type === SET_AVAILABLE_PARTICIPANT_TYPES) {
    return {
      ...state,
      availableParticipantTypes: action.availableParticipantTypes,
    };
  }

  if (action.type === SET_STUDENT_SECTION) {
    const students = action.students || [];
    const selectedStudents = students.map(student =>
      studentFromServerStudent(student, action.sectionId)
    );
    return {
      ...state,
      selectedStudents,
    };
  }

  if (action.type === SET_SECTIONS) {
    const sections = action.sections.map(section =>
      sectionFromServerSection(section)
    );

    let selectedSectionId = state.selectedSectionId;
    // If we have only one section, autoselect it
    if (Object.keys(action.sections).length === 1) {
      selectedSectionId = action.sections[0].id;
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
          if (section[key] === undefined && prevSection[key] !== undefined) {
            throw new Error(
              'SET_SECTIONS called multiple times in a way that would remove data'
            );
          }
        });
      }
    });

    let sectionIds = _.uniq(
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

    return {
      ...state,
      sectionsAreLoaded: true,
      selectedSectionId,
      sectionIds: sectionIds,
      studentSectionIds: studentSectionIds,
      plSectionIds: plSectionIds,
      sections: {
        ...state.sections,
        ..._.keyBy(sections, 'id'),
      },
    };
  }

  if (action.type === SET_COTEACHER_INVITE) {
    return {
      ...state,
      coteacherInvite: action.coteacherInvite,
    };
  }

  if (action.type === SET_COTEACHER_INVITE_FOR_PL) {
    return {
      ...state,
      coteacherInviteForPl: action.coteacherInviteForPl,
    };
  }

  if (action.type === SELECT_SECTION) {
    let sectionId;
    if (action.sectionId) {
      sectionId = parseInt(action.sectionId);
    } else {
      sectionId = NO_SECTION;
    }

    if (
      sectionId !== NO_SECTION &&
      !state.sectionIds.includes(parseInt(sectionId, 10))
    ) {
      sectionId = NO_SECTION;
    }

    return {
      ...state,
      selectedSectionId: sectionId,
    };
  }

  if (action.type === REMOVE_SECTION) {
    const sectionId = action.sectionId;
    const section = state.sections[sectionId];
    if (!section) {
      throw new Error('section does not exist');
    }
    return {
      ...state,
      sectionIds: _.without(state.sectionIds, sectionId),
      studentSectionIds: _.without(state.studentSectionIds, sectionId),
      plSectionIds: _.without(state.plSectionIds, sectionId),
      sections: _.omit(state.sections, sectionId),
    };
  }

  if (action.type === TOGGLE_SECTION_HIDDEN) {
    const {sectionId} = action;
    const section = state.sections[sectionId];
    if (!section) {
      throw new Error('section does not exist');
    }

    return {
      ...state,
      sections: {
        ...state.sections,
        [sectionId]: {
          ...state.sections[sectionId],
          hidden: !state.sections[sectionId].hidden,
        },
      },
    };
  }

  if (action.type === SET_SECTION_CODE_REVIEW_EXPIRES_AT) {
    const {sectionId, codeReviewExpiresAt} = action;
    const section = state.sections[sectionId];
    if (!section) {
      throw new Error('section does not exist');
    }

    return {
      ...state,
      sections: {
        ...state.sections,
        [sectionId]: {
          ...state.sections[sectionId],
          codeReviewExpiresAt: codeReviewExpiresAt
            ? Date.parse(codeReviewExpiresAt)
            : null,
        },
      },
    };
  }

  if (action.type === CREATE_SECTION_BEGIN) {
    const initialSectionData = newSectionData(action.participantType);
    if (action.courseOfferingId) {
      initialSectionData.courseOfferingId = action.courseOfferingId;
    }
    if (action.courseVersionId) {
      initialSectionData.courseVersionId = action.courseVersionId;
    }
    if (action.unitId) {
      initialSectionData.unitId = action.unitId;
    }
    return {
      ...state,
      initialCourseId: initialSectionData.courseId,
      initialUnitId: initialSectionData.unitId,
      initialCourseOfferingId: initialSectionData.courseOfferingId,
      initialCourseVersionId: initialSectionData.courseVersionId,
      initialLoginType: initialSectionData.loginType,
      sectionBeingEdited: initialSectionData,
    };
  }

  if (action.type === EDIT_SECTION_BEGIN) {
    const initialParticipantType =
      state.availableParticipantTypes.length === 1
        ? state.availableParticipantTypes[0]
        : undefined;
    const initialSectionData = action.sectionId
      ? {...state.sections[action.sectionId]}
      : newSectionData(initialParticipantType);
    return {
      ...state,
      initialCourseId: initialSectionData.courseId,
      initialUnitId: initialSectionData.unitId,
      initialCourseOfferingId: initialSectionData.courseOfferingId,
      initialCourseVersionId: initialSectionData.courseVersionId,
      initialLoginType: initialSectionData.loginType,
      sectionBeingEdited: initialSectionData,
      showSectionEditDialog: !action.silent,
    };
  }

  if (action.type === EDIT_SECTION_PROPERTIES) {
    if (!state.sectionBeingEdited) {
      throw new Error(
        'Cannot edit section properties; no section is' +
          ' currently being edited.'
      );
    }

    for (const key in action.props) {
      if (!USER_EDITABLE_SECTION_PROPS.includes(key)) {
        throw new Error(`Cannot edit property ${key}; it's not allowed.`);
      }
    }

    // PL Sections must use email logins and its grade value should be "pl"
    const loginTypeSettings = {};
    const gradeSettings = {};
    if (
      action.props.participantType &&
      action.props.participantType !== ParticipantAudience.student
    ) {
      loginTypeSettings.loginType = SectionLoginType.email;
      gradeSettings.grades = [PlGradeValue];
    }

    const lessonExtraSettings = {};
    if (action.props.unitId && action.props.lessonExtras === undefined) {
      lessonExtraSettings.lessonExtras = true;
    }

    const ttsAutoplayEnabledSettings = {};
    if (action.props.unitId && action.props.ttsAutoplayEnabled === undefined) {
      ttsAutoplayEnabledSettings.ttsAutoplayEnabled = false;
    }

    return {
      ...state,
      sectionBeingEdited: {
        ...state.sectionBeingEdited,
        ...lessonExtraSettings,
        ...ttsAutoplayEnabledSettings,
        ...loginTypeSettings,
        ...gradeSettings,
        ...action.props,
      },
    };
  }

  if (action.type === EDIT_SECTION_CANCEL) {
    return {
      ...state,
      sectionBeingEdited: null,
    };
  }

  if (action.type === EDIT_SECTION_REQUEST) {
    return {
      ...state,
      saveInProgress: true,
    };
  }

  if (action.type === EDIT_SECTION_SUCCESS) {
    const section = sectionFromServerSection(action.serverSection);
    const oldSectionId = action.sectionId;
    const newSection = section.id !== oldSectionId;

    let newSectionIds = state.sectionIds;
    if (newSection) {
      if (state.sectionIds.includes(oldSectionId)) {
        newSectionIds = state.sectionIds.map(id =>
          id === oldSectionId ? section.id : id
        );
      } else {
        newSectionIds = [section.id, ...state.sectionIds];
      }
    }

    const newSections = _.omit(state.sections, oldSectionId);
    newSections[section.id] = {
      ...state.sections[section.id],
      ...section,
    };

    const newStudentSectionIds = Object.values(newSections)
      .filter(
        section => section.participantType === ParticipantAudience.student
      )
      .map(section => section.id);
    const newPlSectionIds = Object.values(newSections)
      .filter(
        section => section.participantType !== ParticipantAudience.student
      )
      .map(section => section.id);

    if (section.loginType !== state.initialLoginType) {
      harness.trackAnalytics(
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

    let assignmentData = {
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
    if (
      // If either of these is not undefined, then assignment changed and should be logged
      !(typeof assignmentData.unit_id === 'undefined') ||
      !(typeof assignmentData.course_id === 'undefined')
    ) {
      harness.trackAnalytics(
        {
          study: 'assignment',
          study_group: 'v1',
          event: newSection ? 'create_section' : 'edit_section_details',
          data_json: JSON.stringify(assignmentData),
        },
        {includeUserId: true}
      );
    }

    // When updating a persisted section, oldSectionId will be identical to
    // section.id. However, if this is a newly persisted section, oldSectionId
    // will represent our temporary section. In that case, we want to delete that
    // section, and replace it with our new one.
    return {
      ...state,
      sectionIds: newSectionIds,
      sections: newSections,
      studentSectionIds: newStudentSectionIds,
      plSectionIds: newPlSectionIds,
      sectionBeingEdited: null,
      saveInProgress: false,
    };
  }

  if (action.type === EDIT_SECTION_FAILURE) {
    return {
      ...state,
      saveInProgress: false,
    };
  }

  if (action.type === ASYNC_LOAD_BEGIN) {
    return {
      ...state,
      asyncLoadComplete: false,
    };
  }

  if (action.type === ASYNC_LOAD_END) {
    return {
      ...state,
      asyncLoadComplete: true,
    };
  }

  if (action.type === SET_ROSTER_PROVIDER) {
    // No-op if this action is called with a non-OAuth section type,
    // since this action is triggered on every section load.
    if (
      OAuthSectionTypes[action.rosterProvider] ||
      action.rosterProvider === SectionLoginType.lti_v1
    ) {
      return {
        ...state,
        rosterProvider: action.rosterProvider,
      };
    }
  }

  if (action.type === SET_ROSTER_PROVIDER_NAME) {
    return {
      ...state,
      rosterProviderName: action.rosterProviderName,
    };
  }

  //
  // Roster import action types
  //

  if (action.type === IMPORT_ROSTER_FLOW_BEGIN) {
    return {
      ...state,
      isRosterDialogOpen: true,
      classrooms: null,
    };
  }

  if (action.type === IMPORT_ROSTER_FLOW_LIST_LOADED) {
    return {
      ...state,
      classrooms: action.classrooms.slice(),
    };
  }

  if (action.type === IMPORT_ROSTER_FLOW_LIST_LOAD_FAILED) {
    return {
      ...state,
      loadError: {
        status: action.status,
        message: action.message,
      },
    };
  }

  if (action.type === IMPORT_ROSTER_FLOW_CANCEL) {
    return {
      ...state,
      isRosterDialogOpen: false,
      rosterProvider: null,
      classrooms: null,
    };
  }

  if (action.type === IMPORT_ROSTER_REQUEST) {
    return {
      ...state,
      classrooms: null,
    };
  }

  if (action.type === IMPORT_ROSTER_SUCCESS) {
    return {
      ...state,
      isRosterDialogOpen: false,
      sectionBeingEdited: {
        ...state.sections[action.sectionId],
        // explicitly unhide section after importing
        hidden: false,
      },
    };
  }

  if (action.type === IMPORT_LTI_ROSTER_SUCCESS) {
    return {
      ...state,
      ltiSyncResult: action.results,
    };
  }

  // DCDO Flag - show/hide Lock Section field
  if (action.type === SET_SHOW_LOCK_SECTION_FIELD) {
    return {
      ...state,
      showLockSectionField: action.showLockSectionField,
    };
  }

  if (action.type === UPDATE_SECTION_AI_TUTOR_ENABLED) {
    const {sectionId, aiTutorEnabled} = action;
    const section = state.sections[sectionId];
    if (!section) {
      throw new Error('section does not exist');
    }

    return {
      ...state,
      sections: {
        ...state.sections,
        [sectionId]: {
          ...state.sections[sectionId],
          aiTutorEnabled: aiTutorEnabled,
        },
      },
    };
  }

  return state;
}

// Helpers and Selectors

function getRoot(state) {
  return state.teacherSections; // Global knowledge eww.
}

export function isRosterDialogOpen(state) {
  return getRoot(state).isRosterDialogOpen;
}

export function rosterProvider(state) {
  return getRoot(state).rosterProvider;
}

export function rosterProviderName(state) {
  return getRoot(state).rosterProviderName;
}

export function sectionCode(state, sectionId) {
  return (getRoot(state).sections[sectionId] || {}).code;
}

export function sectionName(state, sectionId) {
  return (getRoot(state).sections[sectionId] || {}).name;
}

export function ltiSyncResult(state) {
  return getRoot(state).ltiSyncResult;
}

export function syncEnabled(state, sectionId) {
  return (getRoot(state).sections[sectionId] || {}).syncEnabled;
}

export function sectionUnitName(state, sectionId) {
  return (getRoot(state).sections[sectionId] || {}).courseVersionName;
}

export function selectedSection(state) {
  const selectedSectionId = getRoot(state).selectedSectionId;
  if (selectedSectionId) {
    return getRoot(state).sections[selectedSectionId];
  } else {
    return null;
  }
}

export function sectionProvider(state, sectionId) {
  if (isSectionProviderManaged(state, sectionId)) {
    return rosterProvider(state);
  }
  return null;
}

export function sectionProviderName(state, sectionId) {
  if (isSectionProviderManaged(state, sectionId)) {
    return rosterProviderName(state);
  }
  return null;
}

export function isSectionProviderManaged(state, sectionId) {
  return !!(getRoot(state).sections[sectionId] || {}).providerManaged;
}

export function isSaveInProgress(state) {
  return getRoot(state).saveInProgress;
}

export function assignedCourseOffering(state) {
  const {sectionBeingEdited, courseOfferings} = getRoot(state);

  return courseOfferings[sectionBeingEdited?.courseOfferingId];
}

export function getVisibleSections(state) {
  const allSections = Object.values(getRoot(state).sections);
  return sortSectionsList(allSections || []).filter(section => !section.hidden);
}

/**
 * Gets the data needed by Reacttabular to show a sortable table
 * @param {object} state - Full store state
 * @param {number[]} sectionIds - List of section ids we want row data for
 */
export function getSectionRows(state, sectionIds) {
  const {sections, courseOfferings, courseOfferingsAreLoaded} = getRoot(state);
  return sectionIds.map(id => ({
    ..._.pick(sections[id], [
      'id',
      'name',
      'courseVersionName',
      'courseDisplayName',
      'loginType',
      'loginTypeName',
      'studentCount',
      'code',
      'participantType',
      'grades',
      'providerManaged',
      'hidden',
    ]),
    assignmentNames: assignmentNames(courseOfferings, sections[id]),
    assignmentPaths: assignmentPaths(courseOfferings, sections[id]),
    courseOfferingsAreLoaded,
  }));
}

export function getAssignmentName(state, sectionId) {
  const {sections, courseOfferings} = getRoot(state);
  return assignmentNames(courseOfferings, sections[sectionId])[0];
}
/**
 * Maps from the data we get back from the server for a section, to the format
 * we want to have in our store.
 */
export const sectionFromServerSection = serverSection => ({
  id: serverSection.id,
  name: serverSection.name,
  courseVersionName: serverSection.courseVersionName,
  createdAt: serverSection.createdAt,
  loginType: serverSection.login_type,
  loginTypeName: serverSection.login_type_name,
  grades: serverSection.grades,
  providerManaged: serverSection.providerManaged || false, // TODO: (josh) make this required when /v2/sections API is deprecated
  lessonExtras: serverSection.lesson_extras,
  pairingAllowed: serverSection.pairing_allowed,
  ttsAutoplayEnabled: serverSection.tts_autoplay_enabled,
  sharingDisabled: serverSection.sharing_disabled,
  studentCount: serverSection.studentCount,
  code: serverSection.code,
  courseOfferingId: serverSection.course_offering_id,
  courseVersionId: serverSection.course_version_id,
  courseDisplayName: serverSection.course_display_name,
  unitId: serverSection.unit_id,
  courseId: serverSection.course_id,
  hidden: serverSection.hidden,
  restrictSection: serverSection.restrict_section,
  postMilestoneDisabled: serverSection.post_milestone_disabled,
  codeReviewExpiresAt: serverSection.code_review_expires_at
    ? Date.parse(serverSection.code_review_expires_at)
    : null,
  isAssignedCSA: serverSection.is_assigned_csa,
  participantType: serverSection.participant_type,
  sectionInstructors: serverSection.section_instructors,
  syncEnabled: serverSection.sync_enabled,
  aiTutorEnabled: serverSection.ai_tutor_enabled,
});

/**
 * Maps from the data we get back from the server for a student, to the format
 * we want to have in our store.
 */
export const studentFromServerStudent = (serverStudent, sectionId) => ({
  sectionId: sectionId,
  id: serverStudent.id,
  name: serverStudent.name,
  familyName: serverStudent.family_name,
  sharingDisabled: serverStudent.sharing_disabled,
  secretPicturePath: serverStudent.secret_picture_path,
  secretPictureName: serverStudent.secret_picture_name,
  secretWords: serverStudent.secret_words,
  userType: serverStudent.user_type,
});

/**
 * Map from client sectionShape to well-formatted params for updating the
 * section on the server via the sections API.
 * @param {sectionShape} section
 */
export function serverSectionFromSection(section) {
  // Lazy: We leave some extra properties on this object (they're ignored by
  // the server for now) hoping this can eventually become a pass-through.
  return {
    ...section,
    login_type: section.loginType,
    lesson_extras: section.lessonExtras,
    pairing_allowed: section.pairingAllowed,
    tts_autoplay_enabled: section.ttsAutoplayEnabled,
    sharing_disabled: section.sharingDisabled,
    course_offering_id: section.courseOfferingId,
    course_version_id: section.courseVersionId,
    unit_id: section.unitId,
    course_id: section.courseId,
    restrict_section: section.restrictSection,
    participant_type: section.participantType,
    ai_tutor_enabled: section.aiTutorEnabled,
  };
}

const assignmentsForSection = (courseOfferings, section) => {
  const assignments = [];
  if (section.courseOfferingId && section.courseVersionId) {
    const courseVersion =
      courseOfferings[section.courseOfferingId]?.course_versions[
        section.courseVersionId
      ];
    if (courseVersion) {
      assignments.push(courseVersion);
      if (section.unitId && courseVersion.type === 'UnitGroup') {
        if (courseVersion.units[section.unitId]) {
          assignments.push(courseVersion.units[section.unitId]);
        }
      }
    }
  }

  return assignments;
};

/**
 * Get the name of the course/unit assigned to the given section
 * @returns {string[]}
 */
export const assignmentNames = (courseOfferings, section) => {
  const assignments = assignmentsForSection(courseOfferings, section);
  // we might not have an assignment object if we have a section that was somehow
  // assigned to a hidden unit (and we dont have permissions to see hidden units)
  return assignments.map(assignment => (assignment ? assignment.name : ''));
};

/**
 * Get the path of the course/unit assigned to the given section
 * @returns {string[]}
 */
export const assignmentPaths = (courseOfferings, section) => {
  const assignments = assignmentsForSection(courseOfferings, section);
  return assignments.map(assignment => (assignment ? assignment.path : ''));
};

/**
 * Ask whether the user is currently adding a new section using
 * the Add Section dialog.
 */
export function isAddingSection(state) {
  return !!(state.sectionBeingEdited && state.sectionBeingEdited.id < 0);
}

/**
 * @param {object} state - state.teacherSections in redux tree
 * Extract a list of name/id for each section
 */
export function sectionsNameAndId(state) {
  return sortSectionsList(
    state.sectionIds.map(id => ({
      id: parseInt(id, 10),
      name: state.sections[id].name,
    }))
  );
}

/**
 * @param {object} state - state.teacherSections in redux tree
 */
export function sectionsForDropdown(
  state,
  courseOfferingId,
  courseVersionId,
  unitId
) {
  return sortedSectionsList(state.sections).map(section => ({
    ...section,
    isAssigned:
      (unitId !== null && section.unitId === unitId) ||
      (courseOfferingId !== null &&
        section.courseOfferingId === courseOfferingId &&
        courseVersionId !== null &&
        section.courseVersionId === courseVersionId),
  }));
}

/**
 * @param {object} sectionsObject - an object containing sections keyed by id
 * Converts an unordered dictionary of sections into a sorted array
 */
export const sortedSectionsList = sectionsObject =>
  sortSectionsList(Object.values(sectionsObject));

/**
 * @param {array} sectionsList - an array of section objects
 * Sorts an array of sections by descending id
 */
export const sortSectionsList = sectionsList =>
  sectionsList.sort((a, b) => b.id - a.id);

/**
 * @param {object} state - Full state of redux tree
 */
export function hiddenSectionIds(state) {
  state = getRoot(state);
  return state.sectionIds.filter(id => state.sections[id].hidden);
}

/**
 * @param {object} state - Full state of redux tree
 */
export function hiddenStudentSectionIds(state) {
  state = getRoot(state);
  return state.sectionIds.filter(
    id =>
      state.sections[id].hidden &&
      state.sections[id].participantType === ParticipantAudience.student
  );
}

/**
 * @param {object} state - Full state of redux tree
 */
export function hiddenPlSectionIds(state) {
  state = getRoot(state);
  return state.sectionIds.filter(
    id =>
      state.sections[id].hidden &&
      state.sections[id].participantType !== ParticipantAudience.student
  );
}

export const studentShape = PropTypes.shape({
  sectionId: PropTypes.number,
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  familyName: PropTypes.string,
  sharingDisabled: PropTypes.bool,
  secretPicturePath: PropTypes.string,
  secretWords: PropTypes.string,
});
