import _ from 'lodash';

import {Section} from '@code-dot-org/api/models/sections';

import {
  ParticipantAudience,
  AssignmentCourseOffering,
  AssignmentCourseVersion,
  AssignmentCourseVersionUnit,
  ServerSection,
  ServerStudent,
} from '../types';

import type {RootState} from './store';

/**
 * @const {string[]} The only properties that can be updated by the user
 * when creating or editing a section.
 */
export const USER_EDITABLE_SECTION_PROPS = [
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

// Helpers and Selectors

export function getRoot(state: RootState): RootState['teacherSections'] {
  return state.teacherSections;
}

export function isRosterDialogOpen(state: RootState) {
  return getRoot(state).isRosterDialogOpen;
}

export function rosterProvider(state: RootState) {
  return getRoot(state).rosterProvider;
}

export function rosterProviderName(state: RootState) {
  return getRoot(state).rosterProviderName;
}

export function sectionCode(state: RootState, sectionId: number) {
  return (getRoot(state).sections[sectionId] || {}).code;
}

export function sectionName(state: RootState, sectionId: number) {
  return (getRoot(state).sections[sectionId] || {}).name;
}

export function ltiSyncResult(state: RootState) {
  return getRoot(state).ltiSyncResult;
}

export function syncEnabled(state: RootState, sectionId: number) {
  return (getRoot(state).sections[sectionId] || {}).syncEnabled;
}

export function sectionUnitName(state: RootState, sectionId: number) {
  return (getRoot(state).sections[sectionId] || {}).courseVersionName;
}

export function selectedSectionSelector(state: RootState) {
  const selectedSectionId = getRoot(state).selectedSectionId;
  if (selectedSectionId) {
    return getRoot(state).sections[selectedSectionId];
  } else {
    return null;
  }
}

export function sectionProvider(state: RootState, sectionId: number) {
  if (isSectionProviderManaged(state, sectionId)) {
    return rosterProvider(state);
  }
  return null;
}

export function sectionProviderName(state: RootState, sectionId: number) {
  if (isSectionProviderManaged(state, sectionId)) {
    return rosterProviderName(state);
  }
  return null;
}

export function isSectionProviderManaged(state: RootState, sectionId: number) {
  return !!(getRoot(state).sections[sectionId] || {}).providerManaged;
}

export function isSaveInProgress(state: RootState) {
  return getRoot(state).saveInProgress;
}

export function assignedCourseOffering(
  state: RootState,
): AssignmentCourseOffering | undefined {
  const {sectionBeingEdited, courseOfferings} = getRoot(state);

  const id = sectionBeingEdited?.courseOfferingId;
  if (id) {
    return courseOfferings[id];
  }
}

export function getVisibleSections(state: RootState) {
  const allSections: Section[] = Object.values(getRoot(state).sections);
  return sortSectionsList(allSections || []).filter(section => !section.hidden);
}

/**
 * Gets the data needed by Reacttabular to show a sortable table
 * @param {object} state - Full store state
 * @param {number[]} sectionIds - List of section ids we want row data for
 */
export function getSectionRows(state: RootState, sectionIds: number[]) {
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
      'isAssignedSingleUnitCourse',
    ]),
    assignmentNames: assignmentNames(courseOfferings, sections[id]),
    assignmentPaths: assignmentPaths(courseOfferings, sections[id]),
    courseOfferingsAreLoaded,
  }));
}

export function getAssignmentName(state: RootState, sectionId: number) {
  const {sections, courseOfferings} = getRoot(state);
  return assignmentNames(courseOfferings, sections[sectionId])[0];
}
/**
 * Maps from the data we get back from the server for a section, to the format
 * we want to have in our store.
 */
export const sectionFromServerSection: (
  serverSection: ServerSection,
) => Section = (serverSection: ServerSection) => ({
  id: serverSection.id,
  name: serverSection.name,
  courseVersionName: serverSection.courseVersionName,
  unitName: serverSection.is_assigned_single_unit_course
    ? serverSection.script?.name
    : serverSection.unitName,
  unitPosition:
    serverSection.unitPosition === null
      ? undefined
      : serverSection.unitPosition,
  isAssignedStandaloneCourse: serverSection.isAssignedStandaloneCourse,
  isAssignedSingleUnitCourse: serverSection.is_assigned_single_unit_course,
  createdAt: serverSection.createdAt,
  loginType: serverSection.login_type,
  loginTypeName: serverSection.login_type_name,
  grades: serverSection.grades || [],
  providerManaged: !!serverSection.providerManaged,
  lessonExtras: serverSection.lesson_extras,
  pairingAllowed: serverSection.pairing_allowed,
  ttsAutoplayEnabled: !!serverSection.tts_autoplay_enabled,
  sharingDisabled: serverSection.sharing_disabled,
  studentCount: serverSection.studentCount,
  code: serverSection.code,
  courseOfferingId: serverSection.course_offering_id || undefined,
  courseVersionId: serverSection.course_version_id || undefined,
  courseDisplayName: serverSection.course_display_name || undefined,
  course: serverSection.course
    ? {
        courseOfferingId: serverSection.course.course_offering_id || undefined,
        versionId: serverSection.course.version_id || undefined,
        unitId: serverSection.course.unit_id || undefined,
        lessonExtrasAvailable: serverSection.course.lesson_extras_available,
        textToSpeechEnabled: serverSection.course.text_to_speech_enabled,
      }
    : undefined,
  unitId: serverSection.is_assigned_single_unit_course
    ? serverSection.script?.id || undefined
    : serverSection.unit_id || undefined,
  courseId: serverSection.course_id || undefined,
  hidden: serverSection.hidden,
  restrictSection: !!serverSection.restrict_section,
  postMilestoneDisabled: serverSection.post_milestone_disabled,
  codeReviewExpiresAt: serverSection.code_review_expires_at
    ? Date.parse(serverSection.code_review_expires_at)
    : undefined,
  isAssignedCSA: serverSection.is_assigned_csa,
  participantType: serverSection.participant_type,
  sectionInstructors: serverSection.sectionInstructors?.map(instructor => ({
    id: instructor?.id,
    status: instructor?.status,
    instructorEmail: instructor?.instructor_email,
    instructorName: instructor?.instructor_name,
    sectionName: instructor?.section_name,
    sectionId: instructor?.section_id,
    invitedByEmail: instructor?.invited_by_email,
    invitedByName: instructor?.invited_by_name,
    participantType: instructor?.participant_type,
  })),
  primaryInstructor: serverSection.primaryInstructor,
  syncEnabled: serverSection.sync_enabled,
  aiTutorEnabled: !!serverSection.ai_tutor_enabled,
  anyStudentHasProgress: serverSection.any_student_has_progress,
  atRiskAgeGatedDate: serverSection.at_risk_age_gated_date
    ? new Date(serverSection.at_risk_age_gated_date)
    : undefined,
  atRiskAgeGatedUsState: serverSection.at_risk_age_gated_us_state,
  avatarColor: serverSection.avatar_color || undefined,
  avatarEmoji: serverSection.avatar_emoji || undefined,
});

/**
 * Maps from the data we get back from the server for a student, to the format
 * we want to have in our store.
 */
export const studentFromServerStudent = (
  serverStudent: ServerStudent,
  sectionId: number,
) => ({
  sectionId: sectionId,
  id: serverStudent.id,
  name: serverStudent.name,
  familyName: serverStudent.family_name,
  sharingDisabled: serverStudent.sharing_disabled,

  // @deprecated Use `secretPictureUrl` instead
  secretPicturePath: serverStudent.secret_picture_path,
  secretPictureUrl: serverStudent.secret_picture_url,

  secretPictureName: serverStudent.secret_picture_name,
  secretWords: serverStudent.secret_words,
  userType: serverStudent.user_type,
});

/**
 * Map from client sectionShape to well-formatted params for updating the
 * section on the server via the sections API.
 * @param {sectionShape} section
 */
export function serverSectionFromSection(section: Section): ServerSection {
  // Lazy: We leave some extra properties on this object (they're ignored by
  // the server for now) hoping this can eventually become a pass-through.
  return {
    ...section,
    course:
      section.course !== undefined
        ? {
            course_offering_id: section.course.courseOfferingId || null,
            version_id: section.course.versionId || null,
            unit_id: section.course.unitId || null,
            lesson_extras_available: section.course.lessonExtrasAvailable,
            text_to_speech_enabled: section.course.textToSpeechEnabled,
          }
        : undefined,
    sectionInstructors: section.sectionInstructors?.map(instructor => ({
      id: instructor?.id,
      status: instructor?.status,
      instructor_email: instructor?.instructorEmail,
      instructor_name: instructor?.instructorName,
      section_name: instructor?.sectionName,
      section_id: instructor?.sectionId,
      invited_by_email: instructor?.invitedByEmail,
      invited_by_name: instructor?.invitedByName,
      participant_type: instructor?.participantType,
    })),
    login_type: section.loginType!,
    lesson_extras: section.lessonExtras,
    pairing_allowed: section.pairingAllowed,
    tts_autoplay_enabled: section.ttsAutoplayEnabled,
    sharing_disabled: section.sharingDisabled,
    course_offering_id: section.courseOfferingId,
    course_version_id: section.courseVersionId,
    unit_id: section.unitId,
    course_id: section.courseId || null,
    restrict_section: section.restrictSection,
    participant_type: section.participantType,
    ai_tutor_enabled: section.aiTutorEnabled,
    at_risk_age_gated_date: section.atRiskAgeGatedDate?.toISOString(),
    at_risk_age_gated_us_state: section.atRiskAgeGatedUsState,
  };
}

export function newSectionData(participantType?: string): Section {
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
    participantType,
    code: '',
    isAssignedStandaloneCourse: false,
    hidden: false,
    restrictSection: false,
    aiTutorEnabled: false,
  };
}

const assignmentsForSection = (
  courseOfferings: AssignmentCourseOffering[],
  section: Section,
) => {
  const assignments: (AssignmentCourseVersionUnit | AssignmentCourseVersion)[] =
    [];
  if (section.courseOfferingId && section.courseVersionId) {
    const courseVersion =
      courseOfferings[section.courseOfferingId]?.courseVersions[
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
 */
export const assignmentNames = (
  courseOfferings: AssignmentCourseOffering[],
  section: Section,
) => {
  const assignments = assignmentsForSection(courseOfferings, section);
  // we might not have an assignment object if we have a section that was somehow
  // assigned to a hidden unit (and we dont have permissions to see hidden units)
  return assignments.map(assignment => (assignment ? assignment.name : ''));
};

/**
 * Get the path of the course/unit assigned to the given section
 */
export const assignmentPaths = (
  courseOfferings: AssignmentCourseOffering[],
  section: Section,
) => {
  const assignments = assignmentsForSection(courseOfferings, section);
  return assignments.map(assignment => (assignment ? assignment.path : ''));
};

/**
 * Ask whether the user is currently adding a new section using
 * the Add Section dialog.
 */
export function isAddingSection(state: RootState['teacherSections']) {
  return !!(state.sectionBeingEdited && state.sectionBeingEdited.id < 0);
}

/**
 * @param state - state.teacherSections in redux tree
 * Extract a list of name/id for each section
 */
export function sectionsNameAndId(state: RootState['teacherSections']): {
  id: number;
  name: string;
}[] {
  return sortSectionsList(
    state.sectionIds.map(id => ({
      id,
      name: state.sections[id].name,
    })),
  );
}

/**
 * @param state - state.teacherSections in redux tree
 */
export function sectionsForDropdown(
  state: RootState['teacherSections'],
  courseOfferingId: number,
  courseVersionId: number,
  unitId: number,
) {
  return sortedSectionsList(state.sections)
    .filter(section => !section.hidden)
    .map(section => ({
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
 * @param sectionsObject - an object containing sections keyed by id
 * Converts an unordered dictionary of sections into a sorted array
 */
export const sortedSectionsList: (sectionsObject: {
  [id: string]: Section;
}) => Section[] = sectionsObject =>
  sortSectionsList(Object.values(sectionsObject));

/**
 * @param sectionsList - an array of section objects
 * Sorts an array of sections by descending id
 */
export const sortSectionsList: <T extends Pick<Section, 'id' | 'name'>>(
  sectionsList: T[],
) => T[] = <T extends Pick<Section, 'id' | 'name'>>(sectionsList: T[]) =>
  sectionsList.sort((a, b) => b.id - a.id);

/**
 * @param state - Full state of redux tree
 */
export function hiddenSectionIds(state: RootState) {
  const innerState = getRoot(state);
  return innerState.sectionIds.filter(id => innerState.sections[id].hidden);
}

/**
 * @param state - Full state of redux tree
 */
export function hiddenStudentSectionIds(state: RootState) {
  const innerState = getRoot(state);
  return innerState.sectionIds.filter(
    id =>
      innerState.sections[id].hidden &&
      innerState.sections[id].participantType === ParticipantAudience.Student,
  );
}

/**
 * @param state - Full state of redux tree
 */
export function hiddenPlSectionIds(state: RootState) {
  const innerState = getRoot(state);
  return innerState.sectionIds.filter(
    id =>
      innerState.sections[id].hidden &&
      innerState.sections[id].participantType !== ParticipantAudience.Student,
  );
}

/**
 * @param state - state.teacherSections in redux tree
 * @return A list of sections which have students at risk of being age
 * gated by CAP.
 */
export function atRiskAgeGatedSections(state: RootState) {
  const innerState = getRoot(state);
  // Convert from a Map to an Array.
  const sections = Object.values(innerState.sections || {});
  // Only non-archived sections can be at risk.
  // Select only the sections which have students at risk.
  return sections.filter(
    section => !section.hidden && section.atRiskAgeGatedDate,
  );
}
