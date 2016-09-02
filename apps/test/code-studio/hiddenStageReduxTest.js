import { assert } from 'chai';
import { createStore } from '@cdo/apps/redux';
import { combineReducers } from 'redux';
import sinon from 'sinon';

import { initProgress } from '@cdo/apps/code-studio/progressRedux';
import reducer from '@cdo/apps/code-studio/hiddenStageRedux';

describe('reducer tests', () => {
  it('initializes based on initProgress', () => {
    const action = initProgress({
      currentLevelId: null,
      professionalLearningCourse: false,
      saveAnswersBeforeNavigation: false,
      peerReviewsRequired: 0,
      stages: [
        {
          id: 123,
          name: 'Stage 123',
          hidden: false
        },
        {
          id: 345,
          name: 'Stage 345',
          hidden: true
        }
      ]
    });
    const state = reducer(undefined, action);

    assert.deepEqual(state, {
      123: false,
      345: true
    });
  });
});
