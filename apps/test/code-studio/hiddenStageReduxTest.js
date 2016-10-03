import { assert } from 'chai';
import { createStore } from '@cdo/apps/redux';
import { combineReducers } from 'redux';
import sinon from 'sinon';

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

  it('initializes with server results after calling getHiddenStages', () => {
    const state = store.getState().hiddenStage;
    assert.deepEqual(state, {
      initialized: false
    });

    const action = getHiddenStages('scriptName');
    store.dispatch(action);

    lastRequest.respond(200, { "Content-Type": "application/json" }, JSON.stringify([123, 456]));

    const nextState = store.getState().hiddenStage;
    assert.deepEqual(nextState, {
      initialized: true,
      123: true,
      456: true
    });
  });

  it('can toggle hidden state', () => {
    const state = store.getState().hiddenStage;
    assert.deepEqual(state, {
      initialized: false
    });

    let action, nextState;

    action = toggleHidden('scriptName', 123, true);
    store.dispatch(action);
    nextState = store.getState().hiddenStage;
    assert.deepEqual(nextState, {
      initialized: false,
      123: true
    });

    action = toggleHidden('scriptName', 123, false);
    store.dispatch(action);
    nextState = store.getState().hiddenStage;
    assert.deepEqual(nextState, {
      initialized: false,
      123: false
    });

    action = toggleHidden('scriptName', 345, true);
    store.dispatch(action);
    nextState = store.getState().hiddenStage;
    console.log(nextState);
    assert.deepEqual(nextState, {
      initialized: false,
      123: false,
      345: true
    });
  });
});
