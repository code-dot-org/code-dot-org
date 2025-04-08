import _ from 'lodash';

import {ParticipantAudience} from '@cdo/apps/generated/curriculum/sharedCourseConstants';

import {Section} from './types/teacherSectionTypes';

// Returns a list of section IDs with the order from orderedSectionIds and
// all sections that are not hidden and have a participantType of student appended.
export const getSectionOrderIds = (
  sections: Section[],
  orderedSectionIds: number[]
) => {
  const filteredSections = sections
    .filter(section => section.participantType === ParticipantAudience.student)
    .filter(section => !section.hidden)
    .map(section => section.id);

  const sectionsToPrepend = _.difference(orderedSectionIds, filteredSections);

  const orderedSectionsFiltered = _.intersection(
    orderedSectionIds,
    filteredSections
  );

  return [...sectionsToPrepend, ...orderedSectionsFiltered];
};
