import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import PropTypes from 'prop-types';
import React from 'react';

import {
  LockStatus,
  saveLockState,
  useGetLockState,
} from '@cdo/apps/code-studio/components/progress/lessonLockDialog/LessonLockDataApi';
import * as useFetch from '@cdo/apps/util/useFetch';

window.fetch = jest.fn();

describe('LessonLockDataApi', () => {
  const fakeUnitId = 1;
  const fakeLessonId = 2;
  const fakeSectionId = 3;

  // Functional react component to host the useGetLockState hook
  let useGetLockStateReturnValue = {
    current: null,
  };
  const UseGetLockStateHarness = ({unitId, lessonId, sectionId}) => {
    useGetLockStateReturnValue.current = useGetLockState(
      unitId,
      lessonId,
      sectionId
    );
    return null;
  };

  describe('useGetLockState', () => {
    it('returns the expected lock state', () => {
      const fakeLockStatusData = {
        [fakeSectionId]: {
          lessons: {
            [fakeLessonId]: [
              {
                user_level_data: {},
                name: 'Student1',
                locked: true,
                readonly_answers: false,
              },
              {
                user_level_data: {},
                name: 'Student2',
                locked: false,
                readonly_answers: false,
              },
            ],
          },
        },
      };
      jest.spyOn(useFetch, 'useFetch').mockClear().mockReturnValue({
        loading: false,
        data: fakeLockStatusData,
      });
      mount(
        <UseGetLockStateHarness
          unitId={fakeUnitId}
          lessonId={fakeLessonId}
          sectionId={fakeSectionId}
        />
      );
      const {loading, serverLockState} = useGetLockStateReturnValue.current;
      expect(loading).toBe(false);
      expect(serverLockState).toEqual([
        {
          name: 'Student1',
          lockStatus: 'Locked',
          userLevelData: {},
        },
        {
          name: 'Student2',
          lockStatus: 'Editable',
          userLevelData: {},
        },
      ]);
      useFetch.useFetch.mockRestore();
    });
  });

  describe('saveLockState', () => {
    it('calls lock_status api with changes in the lock state', () => {
      const fetchSpy = jest.spyOn(window, 'fetch').mockClear();
      const previousLockState = [
        {
          name: 'Student1',
          lockStatus: LockStatus.Editable,
          userLevelData: {},
        },
        {
          name: 'Student2',
          lockStatus: LockStatus.Editable,
          userLevelData: {},
        },
      ];
      const newLockState = [
        {
          name: 'Student1',
          lockStatus: LockStatus.Editable,
          userLevelData: {},
        },
        {
          name: 'Student2',
          lockStatus: LockStatus.Locked,
          userLevelData: {},
        },
      ];

      saveLockState(previousLockState, newLockState, 'fake-csrf');

      expect(fetchSpy).toHaveBeenCalledWith('/api/lock_status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': 'fake-csrf',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          updates: [
            {
              user_level_data: {},
              locked: true,
              readonly_answers: false,
            },
          ],
        }),
      });

      window.fetch.mockRestore();
    });
  });

  UseGetLockStateHarness.propTypes = {
    unitId: PropTypes.number,
    lessonId: PropTypes.number,
    sectionId: PropTypes.number,
  };
});
