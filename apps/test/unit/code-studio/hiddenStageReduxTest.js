import { assert } from 'chai';
import sinon from 'sinon';

import reducer, {
  toggleHidden,
  updateHiddenStage,
  updateHiddenScript,
  getHiddenStages,
  isStageHiddenForSection,
  isScriptHiddenForSection,
  STUDENT_SECTION_ID
} from '@cdo/apps/code-studio/hiddenStageRedux';
import {stubRedux, restoreRedux, registerReducers, getStore} from '@cdo/apps/redux';

function fakeStageLockReducer(state, action) {
  return {
    selectedSection: 1
  };
}

describe('hiddenStageRedux', () => {
  const initialState = reducer(undefined, {});

  describe('reducer tests', () => {
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
        hideableStagesAllowed: false,
        stagesBySection: {},
        scriptsBySection: {}
      });

      const action = getHiddenStages('scriptName', true);
      store.dispatch(action);

      lastRequest.respond(200, { "Content-Type": "application/json" },
        JSON.stringify([123, 456]));

      const nextState = store.getState().hiddenStage;
      assert.deepEqual(nextState.toJS(), {
        initialized: true,
        hideableStagesAllowed: true,
        stagesBySection: {
          STUDENT: {
            123: true,
            456: true
          }
        },
        scriptsBySection: {}
      });
    });

    it('initializes with server results for teacher after calling getHiddenStages', () => {
      const state = store.getState().hiddenStage;
      assert.deepEqual(state.toJS(), {
        initialized: false,
        hideableStagesAllowed: false,
        stagesBySection: {},
        scriptsBySection: {}
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
        hideableStagesAllowed: true,
        stagesBySection: {
          10: {
            123: true,
            456: true
          },
          11: {
            123: true
          }
        },
        scriptsBySection: {}
      });
    });

    it('sets initialized to true if even we have no hidden stages', () => {
      const state = store.getState().hiddenStage;
      assert.deepEqual(state.toJS(), {
        initialized: false,
        hideableStagesAllowed: false,
        stagesBySection: {},
        scriptsBySection: {}
      });

      const action = getHiddenStages('scriptName', true);
      store.dispatch(action);

      lastRequest.respond(200, { "Content-Type": "application/json" },
        JSON.stringify({})
      );

      const nextState = store.getState().hiddenStage;
      assert.deepEqual(nextState.toJS(), {
        initialized: true,
        hideableStagesAllowed: true,
        stagesBySection: {},
        scriptsBySection: {}
      });
    });

    it('can toggle hidden state', () => {
      const state = store.getState().hiddenStage;
      assert.deepEqual(state.toJS(), {
        initialized: false,
        hideableStagesAllowed: false,
        stagesBySection: {},
        scriptsBySection: {}
      });

      let action, nextState;

      // hide a stage
      action = toggleHidden('scriptName', 10, 123, true);
      store.dispatch(action);
      nextState = store.getState().hiddenStage;
      assert.deepEqual(nextState.toJS(), {
        initialized: false,
        hideableStagesAllowed: false,
        stagesBySection: {
          10: {
            123: true
          }
        },
        scriptsBySection: {}
      });

      // hide the same stage in a different section
      action = toggleHidden('scriptName', 11, 123, true);
      store.dispatch(action);
      nextState = store.getState().hiddenStage;
      assert.deepEqual(nextState.toJS(), {
        initialized: false,
        hideableStagesAllowed: false,
        stagesBySection: {
          10: {
            123: true
          },
          11: {
            123: true
          }
        },
        scriptsBySection: {}
      });

      // unhide the stage in one section
      action = toggleHidden('scriptName', 10, 123, false);
      store.dispatch(action);
      nextState = store.getState().hiddenStage;
      assert.deepEqual(nextState.toJS(), {
        initialized: false,
        hideableStagesAllowed: false,
        stagesBySection: {
          10: {
            123: false
          },
          11: {
            123: true
          }
        },
        scriptsBySection: {}
      });

      // hide another stage
      action = toggleHidden('scriptName', 10, 345, true);
      store.dispatch(action);
      nextState = store.getState().hiddenStage;
      assert.deepEqual(nextState.toJS(), {
        initialized: false,
        hideableStagesAllowed: false,
        stagesBySection: {
          10: {
            123: false,
            345: true
          },
          11: {
            123: true
          }
        },
        scriptsBySection: {}
      });
    });

    it('updateHiddenStage', () => {
      const sectionId = '123';
      const stageId = '45';

      const state = reducer(initialState, updateHiddenStage(sectionId, stageId, true));
      assert.strictEqual(state.getIn(['stagesBySection', sectionId, stageId]), true);

      const nexstate = reducer(state, updateHiddenStage(sectionId, stageId, false));
      assert.strictEqual(nexstate.getIn(['stagesBySection', sectionId, stageId]), false);
    });

    it('updateHiddenScript', () => {
      const sectionId = '123';
      const scriptId = '10';

      const state = reducer(initialState, updateHiddenScript(sectionId, scriptId, true));
      assert.strictEqual(state.getIn(['scriptsBySection', sectionId, scriptId]), true);

      const nexstate = reducer(state, updateHiddenScript(sectionId, scriptId, false));
      assert.strictEqual(nexstate.getIn(['scriptsBySection', sectionId, scriptId]), false);
    });
  });

  describe('isStageHiddenForSection', () => {
    const sectionId = '123';
    const hiddenStageId = '45';
    const unhiddenStageId = '67';
    const state = reducer(initialState, updateHiddenStage(sectionId, hiddenStageId, true));

    it('returns false if not given a stageId', () => {
      assert.strictEqual(isStageHiddenForSection(state, sectionId, null), false);
    });

    it('returns false if given an stageId not hidden for the given sectionId', () => {
      assert.strictEqual(isStageHiddenForSection(state, sectionId, unhiddenStageId), false);
    });

    it('returns true if given an stageId that is hidden for the given sectionId', () => {
      assert.strictEqual(isStageHiddenForSection(state, sectionId, hiddenStageId), true);
    });

    it('uses STUDENT_SECTION_ID if none is provided', () => {
      const studentHiddenStage = '35';
      const state = reducer(initialState,
        updateHiddenStage(STUDENT_SECTION_ID, studentHiddenStage, true));
      assert.strictEqual(isStageHiddenForSection(state, null, studentHiddenStage), true);
      assert.strictEqual(isStageHiddenForSection(state, null, unhiddenStageId), false);
    });
  });

  describe('isScriptHiddenForSection', () => {
    const sectionId = '123';
    const hiddenScriptId = '45';
    const unhiddenScriptId = '67';
    const initialState = reducer(undefined, {});
    const state = reducer(initialState, updateHiddenScript(sectionId, hiddenScriptId, true));

    it('returns false if not given a stageId', () => {
      assert.strictEqual(isScriptHiddenForSection(state, sectionId, null), false);
    });

    it('returns false if given an stageId not hidden for the given sectionId', () => {
      assert.strictEqual(isScriptHiddenForSection(state, sectionId, unhiddenScriptId), false);
    });

    it('returns true if given an stageId that is hidden for the given sectionId', () => {
      assert.strictEqual(isScriptHiddenForSection(state, sectionId, hiddenScriptId), true);
    });

    it('uses STUDENT_SECTION_ID if none is provided', () => {
      const studentHiddenScript = '35';
      const state = reducer(initialState,
        updateHiddenScript(STUDENT_SECTION_ID, studentHiddenScript, true));
      assert.strictEqual(isScriptHiddenForSection(state, null, studentHiddenScript), true);
      assert.strictEqual(isScriptHiddenForSection(state, null, unhiddenScriptId), false);
    });
  });
});
