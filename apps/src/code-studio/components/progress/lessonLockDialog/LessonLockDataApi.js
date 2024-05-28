import _ from 'lodash';
import {useMemo} from 'react';

import {useFetch} from '@cdo/apps/util/useFetch';
import {makeEnum} from '@cdo/apps/utils';

export const LockStatus = makeEnum('Locked', 'Editable', 'ReadonlyAnswers');

/**
 * @typedef {Object} UserLockState
 * @property {string} name name of student
 * @property {LockStatus} lockStatus lock status (corresponds to the radio buttons in the dialog)
 * @property {Object} userLevelData opaque user_level data sent by server used to identify a user's lock data
 */

/**
 * @typedef {UserLockState[]} LockState array of UserLockState objects, usually
 *    representing the lock state for the students in a one section
 */

/**
 * Retrieves the lock state from the server and extracts the data needed by
 * the LeesonLockDialog.
 * @param {number} unitId unit id
 * @param {number} lessonId lesson id
 * @param {number} sectionId section id
 * @returns {{loading: boolean, serverLockState: LockState}}
 */
export function useGetLockState(unitId, lessonId, sectionId) {
  const {loading, data} = useFetch(`/api/lock_status?script_id=${unitId}`);

  const serverLockState = useMemo(
    () => extractLockData(data, sectionId, lessonId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, sectionId, lessonId]
  );

  return {loading, serverLockState};
}

/**
 * Extracts and converts the lock status for the given section and lesson.
 * The first parameter is the parsed response to /api/lock_status from the server.
 * @param {Object} serverLockState parsed response to /api/lock_status
 * @param {number} sectionId section id
 * @param {number} lessonId lesson id
 * @returns {LockState}
 *    Array of objects containing lock status info for each student in the given
 *    section for the given lesson.
 */
function extractLockData(serverLockState, sectionId, lessonId) {
  const lessonData =
    serverLockState &&
    serverLockState[sectionId] &&
    serverLockState[sectionId].lessons &&
    serverLockState[sectionId].lessons[lessonId];
  if (!lessonData) {
    return [];
  }

  return lessonData.map(studentData => ({
    name: studentData.name,
    lockStatus: toLockStatus(studentData),
    userLevelData: studentData.user_level_data,
  }));
}

/**
 * Updates the server so that its lock state matches newLockState.
 * @param {LockState} previousLockState
 * @param {LockState} newLockState
 * @param {string} csrfToken
 * @returns {Promise<Response>}
 */
export function saveLockState(previousLockState, newLockState, csrfToken) {
  const lockStateChanges = newLockState
    .filter((item, index) => !_.isEqual(item, previousLockState[index]))
    .map(item => ({
      user_level_data: item.userLevelData,
      locked: item.lockStatus === LockStatus.Locked,
      readonly_answers: item.lockStatus === LockStatus.ReadonlyAnswers,
    }));

  return fetch('/api/lock_status', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
    },
    credentials: 'same-origin',
    body: JSON.stringify({updates: lockStateChanges}),
  });
}

/**
 * Converts an object with locked and readonly_answers fields to a LockStatus enum.
 * @param {{locked: boolean, readonly_answers: boolean}}
 * @returns {LockStatus}
 */
function toLockStatus(lockData) {
  return lockData.locked
    ? LockStatus.Locked
    : lockData.readonly_answers
    ? LockStatus.ReadonlyAnswers
    : LockStatus.Editable;
}
