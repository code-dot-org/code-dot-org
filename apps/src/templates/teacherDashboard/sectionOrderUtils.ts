import _ from 'lodash';

import {ParticipantAudience} from '@cdo/apps/generated/curriculum/sharedCourseConstants';
import HttpClient, {isNetworkError} from '@cdo/apps/util/HttpClient';

import {Section} from './types/teacherSectionTypes';

// Takes filtered section IDs and ordered section IDs and returns a properly ordered list
export const getOrderedSectionIds = (
  filteredSectionIds: number[],
  orderedSectionIds: number[]
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

let isSaving = false;
let pendingSectionOrder: number[] | undefined;

// Sends one save at a time; orders passed in meanwhile collapse to the latest.
export const saveSectionOrder = (orderedSectionIds: number[]) => {
  pendingSectionOrder = orderedSectionIds;
  if (!isSaving) {
    isSaving = true;
    sendPendingSectionOrders();
  }
};

const sendPendingSectionOrders = async () => {
  while (pendingSectionOrder) {
    const sectionOrder = pendingSectionOrder;
    pendingSectionOrder = undefined;
    try {
      await HttpClient.put(
        '/user_preference',
        JSON.stringify({sectionOrder}),
        true,
        {
          'Content-Type': 'application/json; charset=UTF-8',
        }
      );
    } catch (error) {
      // 409: another save for this user held the row, and the server dropped
      // this one rather than wait.
      if (!(isNetworkError(error) && error.response.status === 409)) {
        console.error('Failed to save section order', error);
      }
    }
  }
  isSaving = false;
};
