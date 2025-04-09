import _ from 'lodash';

import {ParticipantAudience} from '@cdo/apps/generated/curriculum/sharedCourseConstants';

import {Section} from './types/teacherSectionTypes';

// Takes filtered section IDs and ordered section IDs and returns a properly ordered list
export const getOrderedSectionIds = (
  filteredSectionIds: number[],
  orderedSectionIds: number[]
): number[] => {
  const sectionsToPrepend = _.difference(filteredSectionIds, orderedSectionIds);

  const orderedSectionsFiltered = _.intersection(
    orderedSectionIds,
    filteredSectionIds
  );

  return [...sectionsToPrepend, ...orderedSectionsFiltered];
};

// Returns a list of section IDs with the order from orderedSectionIds and
// all sections that are not hidden and have a participantType of student prepended.
export const getFilteredSectionOrderIds = (
  sections: Section[],
  orderedSectionIds: number[]
): number[] => {
  const filteredSectionIds = sections
    .filter(section => section.participantType === ParticipantAudience.student)
    .filter(section => !section.hidden)
    .map(section => section.id);

  return getOrderedSectionIds(filteredSectionIds, orderedSectionIds);
};
