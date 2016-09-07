import { assert } from 'chai';
import { createStore } from '@cdo/apps/redux';
import { combineReducers } from 'redux';
import sinon from 'sinon';

import { initProgress } from '@cdo/apps/code-studio/progressRedux';
import reducer, { toggleHidden } from '@cdo/apps/code-studio/hiddenStageRedux';
import experiments from '@cdo/apps/experiments';

describe('reducer tests', () => {
  before(() => {
    experiments.setEnabled('hiddenStages', true);
  });

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

  it('can toggle hidden state', () => {
    const startState = {
      123: false,
      345: true
    };

    let nextState;
    nextState = reducer(startState, toggleHidden(123, true));
    assert.deepEqual(nextState, {
      123: true,
      345: true
    });

    nextState = reducer(startState, toggleHidden(123, false));
    assert.deepEqual(nextState, {
      123: false,
      345: true
    });

    nextState = reducer(startState, toggleHidden(345, false));
    assert.deepEqual(nextState, {
      123: false,
      345: false
    });
  });
});
