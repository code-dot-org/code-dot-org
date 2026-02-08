import _ from 'lodash';

import {
  SectionLoginTypes,
  SectionParticipationTypes,
} from '@code-dot-org/core/api';
import type {Section, SectionParticipationType} from '@code-dot-org/core/api';

import {
  ParticipantAudience,
  AssignmentCourseOffering,
  AssignmentCourseVersion,
  AssignmentCourseVersionUnit,
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

export function newSectionData(
  participantType?: SectionParticipationType,
): Section {
  return {
    id: PENDING_NEW_SECTION_ID,
    name: '',
    loginType: SectionLoginTypes.Email,
    loginTypeName: SectionLoginTypes.Email,
    grades: [''],
    providerManaged: false,
    lessonExtras: true,
    pairingAllowed: true,
    ttsAutoplayEnabled: false,
    sharingDisabled: false,
    studentCount: 0,
    participantType: participantType || SectionParticipationTypes.Student,
    code: '',
    isAssignedSingleUnitCourse: false,
    hidden: false,
    restrictSection: false,
    students: [],
    script: null,
    course: null,
    anyStudentHasProgress: false,
    primaryInstructor: null,
    avatarColor: 9,
    avatarEmoji: 18,
    courseDisplayName: null,
    courseVersionName: null,
    courseVersionId: null,
    courseOfferingId: null,
    courseId: null,
    unitId: null,
    unitName: null,
    unitPosition: null,
    createdAt: '',
    postMilestoneDisabled: false,
    codeReviewExpiresAt: null,
    isAssignedCsa: false,
    sectionInstructors: [],
    syncEnabled: false,
    aiTutorEnabled: false,
    atRiskAgeGatedDate: null,
    atRiskAgeGatedUsState: null,
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
