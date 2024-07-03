import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import reducer, {
  toggleHiddenLesson,
  toggleHiddenScript,
  updateHiddenLesson,
  updateHiddenScript,
  getHiddenLessons,
  isLessonHiddenForSection,
  isScriptHiddenForSection,
  initializeHiddenScripts,
  STUDENT_SECTION_ID,
} from '@cdo/apps/code-studio/hiddenLessonRedux';
import {
  stubRedux,
  restoreRedux,
  registerReducers,
  getStore,
} from '@cdo/apps/redux';

function fakeLessonLockReducer(state, action) {
  return {
    selectedSection: 1,
  };
}

describe('hiddenLessonRedux', () => {
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
        hiddenLesson: reducerSpy,
        lessonLock: fakeLessonLockReducer,
      });
      store = getStore();
    });

    afterEach(() => {
      lastRequest = null;
      xhr.restore();
      restoreRedux();
    });

    it('initializes with server results for student after calling getHiddenLessons', () => {
      const state = store.getState().hiddenLesson;
      expect(state.toJS()).toEqual({
        hiddenLessonsInitialized: false,
        hideableLessonsAllowed: false,
        lessonsBySection: {},
        scriptsBySection: {},
      });

      const action = getHiddenLessons('scriptName', true);
      store.dispatch(action);

      lastRequest.respond(
        200,
        {'Content-Type': 'application/json'},
        JSON.stringify([123, 456])
      );

      const nextState = store.getState().hiddenLesson;
      expect(nextState.toJS()).toEqual({
        hiddenLessonsInitialized: true,
        hideableLessonsAllowed: true,
        lessonsBySection: {
          STUDENT: {
            123: true,
            456: true,
          },
        },
        scriptsBySection: {},
      });
    });

    it('initializes with server results for teacher after calling getHiddenLessons', () => {
      const state = store.getState().hiddenLesson;
      expect(state.toJS()).toEqual({
        hiddenLessonsInitialized: false,
        hideableLessonsAllowed: false,
        lessonsBySection: {},
        scriptsBySection: {},
      });

      const action = getHiddenLessons('scriptName', true);
      store.dispatch(action);

      lastRequest.respond(
        200,
        {'Content-Type': 'application/json'},
        JSON.stringify({
          10: [123, 456],
          11: [123],
        })
      );

      const nextState = store.getState().hiddenLesson;
      expect(nextState.toJS()).toEqual({
        hiddenLessonsInitialized: true,
        hideableLessonsAllowed: true,
        lessonsBySection: {
          10: {
            123: true,
            456: true,
          },
          11: {
            123: true,
          },
        },
        scriptsBySection: {},
      });
    });

    it('sets hiddenLessonsInitialized to true if even we have no hidden lessons', () => {
      const state = store.getState().hiddenLesson;
      expect(state.toJS()).toEqual({
        hiddenLessonsInitialized: false,
        hideableLessonsAllowed: false,
        lessonsBySection: {},
        scriptsBySection: {},
      });

      const action = getHiddenLessons('scriptName', true);
      store.dispatch(action);

      lastRequest.respond(
        200,
        {'Content-Type': 'application/json'},
        JSON.stringify({})
      );

      const nextState = store.getState().hiddenLesson;
      expect(nextState.toJS()).toEqual({
        hiddenLessonsInitialized: true,
        hideableLessonsAllowed: true,
        lessonsBySection: {},
        scriptsBySection: {},
      });
    });

    it('can toggle hidden state', () => {
      const state = store.getState().hiddenLesson;
      expect(state.toJS()).toEqual({
        hiddenLessonsInitialized: false,
        hideableLessonsAllowed: false,
        lessonsBySection: {},
        scriptsBySection: {},
      });

      let action, nextState;

      // hide a lesson
      action = toggleHiddenLesson('scriptName', 10, 123, true);
      store.dispatch(action);
      nextState = store.getState().hiddenLesson;
      expect(nextState.toJS()).toEqual({
        hiddenLessonsInitialized: false,
        hideableLessonsAllowed: false,
        lessonsBySection: {
          10: {
            123: true,
          },
        },
        scriptsBySection: {},
      });

      // hide the same lesson in a different section
      action = toggleHiddenLesson('scriptName', 11, 123, true);
      store.dispatch(action);
      nextState = store.getState().hiddenLesson;
      expect(nextState.toJS()).toEqual({
        hiddenLessonsInitialized: false,
        hideableLessonsAllowed: false,
        lessonsBySection: {
          10: {
            123: true,
          },
          11: {
            123: true,
          },
        },
        scriptsBySection: {},
      });

      // unhide the lesson in one section
      action = toggleHiddenLesson('scriptName', 10, 123, false);
      store.dispatch(action);
      nextState = store.getState().hiddenLesson;
      expect(nextState.toJS()).toEqual({
        hiddenLessonsInitialized: false,
        hideableLessonsAllowed: false,
        lessonsBySection: {
          10: {
            123: false,
          },
          11: {
            123: true,
          },
        },
        scriptsBySection: {},
      });

      // hide another lesson
      action = toggleHiddenLesson('scriptName', 10, 345, true);
      store.dispatch(action);
      nextState = store.getState().hiddenLesson;
      expect(nextState.toJS()).toEqual({
        hiddenLessonsInitialized: false,
        hideableLessonsAllowed: false,
        lessonsBySection: {
          10: {
            123: false,
            345: true,
          },
          11: {
            123: true,
          },
        },
        scriptsBySection: {},
      });
    });

    describe('toggleHiddenScript', () => {
      it('updates state and makes POST', () => {
        const dispatch = sinon.spy();
        toggleHiddenScript('somescript', '123', '45', true)(dispatch);

        expect(
          dispatch.firstCall.calledWithExactly(
            updateHiddenScript('123', '45', true)
          )
        ).toBeTruthy();

        expect(lastRequest.url).toBe('/s/somescript/toggle_hidden');
        expect(lastRequest.requestBody).toBe(
          JSON.stringify({section_id: '123', hidden: true})
        );
      });
    });

    it('updateHiddenLesson', () => {
      const sectionId = '123';
      const lessonId = '45';

      const state = reducer(
        initialState,
        updateHiddenLesson(sectionId, lessonId, true)
      );
      expect(state.getIn(['lessonsBySection', sectionId, lessonId])).toBe(true);

      const nexstate = reducer(
        state,
        updateHiddenLesson(sectionId, lessonId, false)
      );
      expect(nexstate.getIn(['lessonsBySection', sectionId, lessonId])).toBe(
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
      expect(state.getIn(['scriptsBySection', sectionId, scriptId])).toBe(true);

      const nexstate = reducer(
        state,
        updateHiddenScript(sectionId, scriptId, false)
      );
      expect(nexstate.getIn(['scriptsBySection', sectionId, scriptId])).toBe(
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
          123: ['1', '2'],
          456: ['3'],
        };
        initializeHiddenScripts(data)(dispatch);
        expect(dispatch.getCall(0).args[0]).toEqual(
          updateHiddenScript('123', '1', true)
        );
        expect(dispatch.getCall(1).args[0]).toEqual(
          updateHiddenScript('123', '2', true)
        );
        expect(dispatch.getCall(2).args[0]).toEqual(
          updateHiddenScript('456', '3', true)
        );
      });

      it('dispatches for each script for students', () => {
        const data = ['1', '2', '3'];
        initializeHiddenScripts(data)(dispatch);

        expect(dispatch.getCall(0).args[0]).toEqual(
          updateHiddenScript(STUDENT_SECTION_ID, '1', true)
        );
        expect(dispatch.getCall(1).args[0]).toEqual(
          updateHiddenScript(STUDENT_SECTION_ID, '2', true)
        );
        expect(dispatch.getCall(2).args[0]).toEqual(
          updateHiddenScript(STUDENT_SECTION_ID, '3', true)
        );
      });
    });
  });

  describe('isLessonHiddenForSection', () => {
    const sectionId = '123';
    const hiddenLessonId = '45';
    const unhiddenLessonId = '67';
    const state = reducer(
      initialState,
      updateHiddenLesson(sectionId, hiddenLessonId, true)
    );

    it('returns false if not given a lessonId', () => {
      expect(isLessonHiddenForSection(state, sectionId, null)).toBe(false);
    });

    it('returns false if given an lessonId not hidden for the given sectionId', () => {
      expect(isLessonHiddenForSection(state, sectionId, unhiddenLessonId)).toBe(
        false
      );
    });

    it('returns true if given an lessonId that is hidden for the given sectionId', () => {
      expect(isLessonHiddenForSection(state, sectionId, hiddenLessonId)).toBe(
        true
      );
    });

    it('uses STUDENT_SECTION_ID if none is provided', () => {
      const studentHiddenLesson = '35';
      const state = reducer(
        initialState,
        updateHiddenLesson(STUDENT_SECTION_ID, studentHiddenLesson, true)
      );
      expect(isLessonHiddenForSection(state, null, studentHiddenLesson)).toBe(
        true
      );
      expect(isLessonHiddenForSection(state, null, unhiddenLessonId)).toBe(
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

    it('returns false if not given a lessonId', () => {
      expect(isScriptHiddenForSection(state, sectionId, null)).toBe(false);
    });

    it('returns false if given an lessonId not hidden for the given sectionId', () => {
      expect(isScriptHiddenForSection(state, sectionId, unhiddenScriptId)).toBe(
        false
      );
    });

    it('returns true if given an lessonId that is hidden for the given sectionId', () => {
      expect(isScriptHiddenForSection(state, sectionId, hiddenScriptId)).toBe(
        true
      );
    });

    it('uses STUDENT_SECTION_ID if none is provided', () => {
      const studentHiddenScript = '35';
      const state = reducer(
        initialState,
        updateHiddenScript(STUDENT_SECTION_ID, studentHiddenScript, true)
      );
      expect(isScriptHiddenForSection(state, null, studentHiddenScript)).toBe(
        true
      );
      expect(isScriptHiddenForSection(state, null, unhiddenScriptId)).toBe(
        false
      );
    });
  });
});
