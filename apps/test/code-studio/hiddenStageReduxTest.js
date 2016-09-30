import { assert } from 'chai';
import { createStore } from '@cdo/apps/redux';
import { combineReducers } from 'redux';
import sinon from 'sinon';
import Immutable from 'immutable';

import reducer, { toggleHidden, getHiddenStages } from '@cdo/apps/code-studio/hiddenStageRedux';
import experiments from '@cdo/apps/experiments';

function fakeStageLockReducer(state, action) {
  return {
    selectedSection: 1
  };
}

describe('hiddenStage reducer tests', () => {
  let xhr;
  let lastRequest;
  let store;
  let reducerSpy;

  before(() => {
    experiments.setEnabled('hiddenStages', true);
  });

  // Intercept all XHR requests, storing the last one
  beforeEach(() => {
    xhr = sinon.useFakeXMLHttpRequest();
    xhr.onCreate = req => {
      lastRequest = req;
    };
    reducerSpy = sinon.spy(reducer);
    store = createStore(combineReducers({
      hiddenStage: reducerSpy,
      stageLock: fakeStageLockReducer
    }));
  });

  afterEach(() => {
    lastRequest = null;
    xhr.restore();
  });

  it('initializes with server results for student after calling getHiddenStages', () => {
    const state = store.getState().hiddenStage;
    assert.deepEqual(state.toJS(), {
      initialized: false,
      bySection: {}
    });

    const action = getHiddenStages('scriptName');
    store.dispatch(action);

    lastRequest.respond(200, { "Content-Type": "application/json" },
      JSON.stringify([123, 456]));

    const nextState = store.getState().hiddenStage;
    assert.deepEqual(nextState.toJS(), {
      initialized: true,
      bySection: {
        undefined: {
          123: true,
          456: true
        }
      }
    });
  });

  it('initializes with server results for teacher after calling getHiddenStages', () => {
    const state = store.getState().hiddenStage;
    assert.deepEqual(state.toJS(), {
      initialized: false,
      bySection: {}
    });

    const action = getHiddenStages('scriptName');
    store.dispatch(action);

    lastRequest.respond(200, { "Content-Type": "application/json" },
      JSON.stringify({
        10: [123, 456],
        11: [123]
      })
    );

    const nextState = store.getState().hiddenStage;
    assert.deepEqual(nextState.toJS(), {
      initialized: true,
      bySection: {
        10: {
          123: true,
          456: true
        },
        11: {
          123: true
        }
      }
    });
  });

  it('can toggle hidden state', () => {
    const state = store.getState().hiddenStage;
    assert.deepEqual(state.toJS(), {
      initialized: false,
      bySection: {}
    });

    let action, nextState;

    // hide a stage
    action = toggleHidden('scriptName', 10, 123, true);
    store.dispatch(action);
    nextState = store.getState().hiddenStage;
    assert.deepEqual(nextState.toJS(), {
      initialized: false,
      bySection: {
        10: {
          123: true
        }
      }
    });

    // hide the same stage in a different section
    action = toggleHidden('scriptName', 11, 123, true);
    store.dispatch(action);
    nextState = store.getState().hiddenStage;
    assert.deepEqual(nextState.toJS(), {
      initialized: false,
      bySection: {
        10: {
          123: true
        },
        11: {
          123: true
        }
      }
    });

    // unhide the stage in one section
    action = toggleHidden('scriptName', 10, 123, false);
    store.dispatch(action);
    nextState = store.getState().hiddenStage;
    assert.deepEqual(nextState.toJS(), {
      initialized: false,
      bySection: {
        10: {
          123: false
        },
        11: {
          123: true
        }
      }
    });

    // hide another stage
    action = toggleHidden('scriptName', 10, 345, true);
    store.dispatch(action);
    nextState = store.getState().hiddenStage;
    assert.deepEqual(nextState.toJS(), {
      initialized: false,
      bySection: {
        10: {
          123: false,
          345: true
        },
        11: {
          123: true
        }
      }
    });
  });
});
