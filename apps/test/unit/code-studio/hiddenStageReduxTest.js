import { assert } from 'chai';
import sinon from 'sinon';

import reducer, { toggleHidden, getHiddenStages } from '@cdo/apps/code-studio/hiddenStageRedux';
import {stubRedux, restoreRedux, registerReducers, getStore} from '@cdo/apps/redux';

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

  // Intercept all XHR requests, storing the last one
  beforeEach(() => {
    xhr = sinon.useFakeXMLHttpRequest();
    xhr.onCreate = req => {
      lastRequest = req;
    };
    reducerSpy = sinon.spy(reducer);
    stubRedux();
    registerReducers({
      hiddenStage: reducerSpy,
      stageLock: fakeStageLockReducer
    });
    store = getStore();
  });

  afterEach(() => {
    lastRequest = null;
    xhr.restore();
    restoreRedux();
  });

  it('initializes with server results for student after calling getHiddenStages', () => {
    const state = store.getState().hiddenStage;
    assert.deepEqual(state.toJS(), {
      initialized: false,
      hideableAllowed: false,
      bySection: {}
    });

    const action = getHiddenStages('scriptName', true);
    store.dispatch(action);

    lastRequest.respond(200, { "Content-Type": "application/json" },
      JSON.stringify([123, 456]));

    const nextState = store.getState().hiddenStage;
    assert.deepEqual(nextState.toJS(), {
      initialized: true,
      hideableAllowed: true,
      bySection: {
        STUDENT: {
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
      hideableAllowed: false,
      bySection: {}
    });

    const action = getHiddenStages('scriptName', true);
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
      hideableAllowed: true,
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

  it('sets initialized to true if even we have no hidden stages', () => {
    const state = store.getState().hiddenStage;
    assert.deepEqual(state.toJS(), {
      initialized: false,
      hideableAllowed: false,
      bySection: {}
    });

    const action = getHiddenStages('scriptName', true);
    store.dispatch(action);

    lastRequest.respond(200, { "Content-Type": "application/json" },
      JSON.stringify({})
    );

    const nextState = store.getState().hiddenStage;
    assert.deepEqual(nextState.toJS(), {
      initialized: true,
      hideableAllowed: true,
      bySection: {}
    });
  });

  it('can toggle hidden state', () => {
    const state = store.getState().hiddenStage;
    assert.deepEqual(state.toJS(), {
      initialized: false,
      hideableAllowed: false,
      bySection: {}
    });

    let action, nextState;

    // hide a stage
    action = toggleHidden('scriptName', 10, 123, true);
    store.dispatch(action);
    nextState = store.getState().hiddenStage;
    assert.deepEqual(nextState.toJS(), {
      initialized: false,
      hideableAllowed: false,
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
      hideableAllowed: false,
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
      hideableAllowed: false,
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
      hideableAllowed: false,
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
