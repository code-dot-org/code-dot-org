import _ from 'lodash';
import PropTypes from 'prop-types';

import {ParticipantAudience} from '@cdo/apps/generated/curriculum/sharedCourseConstants';

// Helpers and Selectors

export function getRoot(state) {
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
  standaloneUnitId: serverSection.standalone_unit_id,
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
  anyStudentHasProgress: serverSection.any_student_has_progress,
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
