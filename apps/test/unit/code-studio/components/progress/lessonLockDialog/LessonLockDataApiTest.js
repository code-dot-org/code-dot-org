import React from 'react';
import PropTypes from 'prop-types';
import {mount} from 'enzyme';
import {expect} from '../../../../../util/reconfiguredChai';
import sinon from 'sinon';
import {
  LockStatus,
  saveLockState,
  useGetLockState,
} from '@cdo/apps/code-studio/components/progress/lessonLockDialog/LessonLockDataApi';
import * as useFetch from '@cdo/apps/util/useFetch';

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
      sinon.stub(useFetch, 'useFetch').returns({
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
      expect(loading).to.be.false;
      expect(serverLockState).to.deep.equal([
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
      useFetch.useFetch.restore();
    });
  });

  describe('saveLockState', () => {
    it('calls lock_status api with changes in the lock state', () => {
      const fetchSpy = sinon.spy(window, 'fetch');
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

      expect(fetchSpy).to.have.been.calledWith('/api/lock_status', {
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

      window.fetch.restore();
    });
  });

  UseGetLockStateHarness.propTypes = {
    unitId: PropTypes.number,
    lessonId: PropTypes.number,
    sectionId: PropTypes.number,
  };
});
