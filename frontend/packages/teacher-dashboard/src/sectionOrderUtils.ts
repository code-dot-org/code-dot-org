import _ from 'lodash';

import type {ApiClient, QueryClient, Section} from '@code-dot-org/core/api';
import {preferencesKeys, ParticipantAudiences} from '@code-dot-org/core/api';

// Takes filtered section IDs and ordered section IDs and returns a properly ordered list
// If the results are different from the ordered section IDs, it updates the order in the backend.
export const getOrderedSectionIds = (
  filteredSectionIds: number[],
  orderedSectionIds: number[],
): number[] => {
  if (orderedSectionIds.length === 0) {
    return filteredSectionIds;
  }

  if (_.xor(orderedSectionIds, filteredSectionIds).length === 0) {
    return orderedSectionIds;
  }

  const sectionsToPrepend = _.difference(filteredSectionIds, orderedSectionIds);

  const orderedSectionsFiltered = _.intersection(
    orderedSectionIds,
    filteredSectionIds,
  );

  return [...sectionsToPrepend, ...orderedSectionsFiltered];
};

// Returns a list of section IDs with the order from orderedSectionIds and
// all sections that are not hidden and have a participantType of student prepended.
export const getFilteredSectionOrderIds = (
  sections: Section[],
  orderedSectionIds: number[],
): number[] => {
  const filteredSectionIds = sections
    .filter(section => section.participantType === ParticipantAudiences.Student)
    .filter(section => !section.hidden)
    .map(section => section.id);

  return getOrderedSectionIds(filteredSectionIds, orderedSectionIds);
};

export const saveSectionOrder = (
  api: ApiClient,
  query: QueryClient,
  orderedSectionIds: number[],
) => {
  api.preferences.setSectionOrder({
    orderedSectionIds,
  });
  query.invalidateQueries({
    queryKey: preferencesKeys.sectionOrder(),
  });
};
