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

// A teacher who reorders in two tabs can still collide.  Losing that save
// silently reverts the drag on the next page load, so resend once.
const CONFLICT_RETRY_LIMIT = 1;
export const CONFLICT_RETRY_DELAY_MS = 500;

// Sends one save at a time; orders passed in meanwhile collapse to the latest.
export const saveSectionOrder = (orderedSectionIds: number[]) => {
  pendingSectionOrder = orderedSectionIds;
  if (!isSaving) {
    isSaving = true;
    sendPendingSectionOrders();
  }
};

// This module's state outlives a test; jest.clearAllMocks does not reach it.
export const resetSectionOrderSaveStateForTest = () => {
  isSaving = false;
  pendingSectionOrder = undefined;
};

// True when the server answered 409: another connection held the row lock on
// this user's preferences, so it dropped the save rather than wait.
const putSectionOrder = async (sectionOrder: number[]): Promise<boolean> => {
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
    if (isNetworkError(error) && error.response.status === 409) {
      return true;
    }
    console.error('Failed to save section order', error);
  }
  return false;
};

const sendPendingSectionOrders = async () => {
  while (pendingSectionOrder) {
    const sectionOrder = pendingSectionOrder;
    pendingSectionOrder = undefined;

    let conflicts = 0;
    while (await putSectionOrder(sectionOrder)) {
      if (pendingSectionOrder) {
        break;
      }
      if (++conflicts > CONFLICT_RETRY_LIMIT) {
        console.error(
          'Gave up saving section order after repeated conflicts; it will revert on the next page load'
        );
        break;
      }
      await new Promise(resolve =>
        setTimeout(resolve, CONFLICT_RETRY_DELAY_MS)
      );
    }
  }
  isSaving = false;
};
