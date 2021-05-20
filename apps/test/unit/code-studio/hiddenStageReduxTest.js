import {assert} from 'chai';
import sinon from 'sinon';

import reducer, {
  toggleHiddenStage,
  toggleHiddenScript,
  updateHiddenLesson,
  updateHiddenScript,
  getHiddenStages,
  isStageHiddenForSection,
  isScriptHiddenForSection,
  initializeHiddenScripts,
  STUDENT_SECTION_ID
} from '@cdo/apps/code-studio/hiddenStageRedux';
import {
  stubRedux,
  restoreRedux,
  registerReducers,
  getStore
} from '@cdo/apps/redux';

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
        hiddenLessonsInitialized: false,
        hideableLessonsAllowed: false,
        lessonsBySection: {},
        scriptsBySection: {}
      });

      const action = getHiddenStages('scriptName', true);
      store.dispatch(action);

      lastRequest.respond(
        200,
        {'Content-Type': 'application/json'},
        JSON.stringify([123, 456])
      );

      const nextState = store.getState().hiddenStage;
      assert.deepEqual(nextState.toJS(), {
        hiddenLessonsInitialized: true,
        hideableLessonsAllowed: true,
        lessonsBySection: {
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
        hiddenLessonsInitialized: false,
        hideableLessonsAllowed: false,
        lessonsBySection: {},
        scriptsBySection: {}
      });

      const action = getHiddenStages('scriptName', true);
      store.dispatch(action);

      lastRequest.respond(
        200,
        {'Content-Type': 'application/json'},
        JSON.stringify({
          10: [123, 456],
          11: [123]
        })
      );

      const nextState = store.getState().hiddenStage;
      assert.deepEqual(nextState.toJS(), {
        hiddenLessonsInitialized: true,
        hideableLessonsAllowed: true,
        lessonsBySection: {
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

    it('sets hiddenLessonsInitialized to true if even we have no hidden stages', () => {
      const state = store.getState().hiddenStage;
      assert.deepEqual(state.toJS(), {
        hiddenLessonsInitialized: false,
        hideableLessonsAllowed: false,
        lessonsBySection: {},
        scriptsBySection: {}
      });

      const action = getHiddenStages('scriptName', true);
      store.dispatch(action);

      lastRequest.respond(
        200,
        {'Content-Type': 'application/json'},
        JSON.stringify({})
      );

      const nextState = store.getState().hiddenStage;
      assert.deepEqual(nextState.toJS(), {
        hiddenLessonsInitialized: true,
        hideableLessonsAllowed: true,
        lessonsBySection: {},
        scriptsBySection: {}
      });
    });

    it('can toggle hidden state', () => {
      const state = store.getState().hiddenStage;
      assert.deepEqual(state.toJS(), {
        hiddenLessonsInitialized: false,
        hideableLessonsAllowed: false,
        lessonsBySection: {},
        scriptsBySection: {}
      });

      let action, nextState;

      // hide a stage
      action = toggleHiddenStage('scriptName', 10, 123, true);
      store.dispatch(action);
      nextState = store.getState().hiddenStage;
      assert.deepEqual(nextState.toJS(), {
        hiddenLessonsInitialized: false,
        hideableLessonsAllowed: false,
        lessonsBySection: {
          10: {
            123: true
          }
        },
        scriptsBySection: {}
      });

      // hide the same stage in a different section
      action = toggleHiddenStage('scriptName', 11, 123, true);
      store.dispatch(action);
      nextState = store.getState().hiddenStage;
      assert.deepEqual(nextState.toJS(), {
        hiddenLessonsInitialized: false,
        hideableLessonsAllowed: false,
        lessonsBySection: {
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
      action = toggleHiddenStage('scriptName', 10, 123, false);
      store.dispatch(action);
      nextState = store.getState().hiddenStage;
      assert.deepEqual(nextState.toJS(), {
        hiddenLessonsInitialized: false,
        hideableLessonsAllowed: false,
        lessonsBySection: {
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
      action = toggleHiddenStage('scriptName', 10, 345, true);
      store.dispatch(action);
      nextState = store.getState().hiddenStage;
      assert.deepEqual(nextState.toJS(), {
        hiddenLessonsInitialized: false,
        hideableLessonsAllowed: false,
        lessonsBySection: {
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

    describe('toggleHiddenScript', () => {
      it('updates state and makes POST', () => {
        const dispatch = sinon.spy();
        toggleHiddenScript('somescript', '123', '45', true)(dispatch);

        assert(
          dispatch.firstCall.calledWithExactly(
            updateHiddenScript('123', '45', true)
          )
        );

        assert.strictEqual(lastRequest.url, '/s/somescript/toggle_hidden');
        assert.strictEqual(
          lastRequest.requestBody,
          JSON.stringify({section_id: '123', hidden: true})
        );
      });
    });

    it('updateHiddenLesson', () => {
      const sectionId = '123';
      const stageId = '45';

      const state = reducer(
        initialState,
        updateHiddenLesson(sectionId, stageId, true)
      );
      assert.strictEqual(
        state.getIn(['lessonsBySection', sectionId, stageId]),
        true
      );

      const nexstate = reducer(
        state,
        updateHiddenLesson(sectionId, stageId, false)
      );
      assert.strictEqual(
        nexstate.getIn(['lessonsBySection', sectionId, stageId]),
        false
      );
    });

    it('updateHiddenScript', () => {
      const sectionId = '123';
      const scriptId = '10';

      const state = reducer(
        initialState,
        updateHiddenScript(sectionId, scriptId, true)
      );
      assert.strictEqual(
        state.getIn(['scriptsBySection', sectionId, scriptId]),
        true
      );

      const nexstate = reducer(
        state,
        updateHiddenScript(sectionId, scriptId, false)
      );
      assert.strictEqual(
        nexstate.getIn(['scriptsBySection', sectionId, scriptId]),
        false
      );
    });

    describe('initializeHiddenScripts', () => {
      let dispatch;

      beforeEach(() => {
        dispatch = sinon.spy();
      });

      it('dispatches for each section/script for teachers', () => {
        const data = {
          '123': ['1', '2'],
          '456': ['3']
        };
        initializeHiddenScripts(data)(dispatch);
        assert.deepEqual(
          dispatch.getCall(0).args[0],
          updateHiddenScript('123', '1', true)
        );
        assert.deepEqual(
          dispatch.getCall(1).args[0],
          updateHiddenScript('123', '2', true)
        );
        assert.deepEqual(
          dispatch.getCall(2).args[0],
          updateHiddenScript('456', '3', true)
        );
      });

      it('dispatches for each script for students', () => {
        const data = ['1', '2', '3'];
        initializeHiddenScripts(data)(dispatch);

        assert.deepEqual(
          dispatch.getCall(0).args[0],
          updateHiddenScript(STUDENT_SECTION_ID, '1', true)
        );
        assert.deepEqual(
          dispatch.getCall(1).args[0],
          updateHiddenScript(STUDENT_SECTION_ID, '2', true)
        );
        assert.deepEqual(
          dispatch.getCall(2).args[0],
          updateHiddenScript(STUDENT_SECTION_ID, '3', true)
        );
      });
    });
  });

  describe('isStageHiddenForSection', () => {
    const sectionId = '123';
    const hiddenStageId = '45';
    const unhiddenStageId = '67';
    const state = reducer(
      initialState,
      updateHiddenLesson(sectionId, hiddenStageId, true)
    );

    it('returns false if not given a stageId', () => {
      assert.strictEqual(
        isStageHiddenForSection(state, sectionId, null),
        false
      );
    });

    it('returns false if given an stageId not hidden for the given sectionId', () => {
      assert.strictEqual(
        isStageHiddenForSection(state, sectionId, unhiddenStageId),
        false
      );
    });

    it('returns true if given an stageId that is hidden for the given sectionId', () => {
      assert.strictEqual(
        isStageHiddenForSection(state, sectionId, hiddenStageId),
        true
      );
    });

    it('uses STUDENT_SECTION_ID if none is provided', () => {
      const studentHiddenStage = '35';
      const state = reducer(
        initialState,
        updateHiddenLesson(STUDENT_SECTION_ID, studentHiddenStage, true)
      );
      assert.strictEqual(
        isStageHiddenForSection(state, null, studentHiddenStage),
        true
      );
      assert.strictEqual(
        isStageHiddenForSection(state, null, unhiddenStageId),
        false
      );
    });
  });

  describe('isScriptHiddenForSection', () => {
    const sectionId = '123';
    const hiddenScriptId = '45';
    const unhiddenScriptId = '67';
    const initialState = reducer(undefined, {});
    const state = reducer(
      initialState,
      updateHiddenScript(sectionId, hiddenScriptId, true)
    );

    it('returns false if not given a stageId', () => {
      assert.strictEqual(
        isScriptHiddenForSection(state, sectionId, null),
        false
      );
    });

    it('returns false if given an stageId not hidden for the given sectionId', () => {
      assert.strictEqual(
        isScriptHiddenForSection(state, sectionId, unhiddenScriptId),
        false
      );
    });

    it('returns true if given an stageId that is hidden for the given sectionId', () => {
      assert.strictEqual(
        isScriptHiddenForSection(state, sectionId, hiddenScriptId),
        true
      );
    });

    it('uses STUDENT_SECTION_ID if none is provided', () => {
      const studentHiddenScript = '35';
      const state = reducer(
        initialState,
        updateHiddenScript(STUDENT_SECTION_ID, studentHiddenScript, true)
      );
      assert.strictEqual(
        isScriptHiddenForSection(state, null, studentHiddenScript),
        true
      );
      assert.strictEqual(
        isScriptHiddenForSection(state, null, unhiddenScriptId),
        false
      );
    });
  });
});
