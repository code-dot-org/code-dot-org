import $ from 'jquery';
import _ from 'lodash';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import reducer, {
  LockStatus,
  beginSave,
  finishSave,
  openLockDialog,
  closeLockDialog,
  saveLockDialog,
  lockLesson,
  BEGIN_SAVE,
  FINISH_SAVE,
  CLOSE_LOCK_DIALOG,
  fullyLockedLessonMapping,
  setSectionLockStatus,
  refetchSectionLockStatus,
} from '@cdo/apps/code-studio/lessonLockRedux';
import {
  stubRedux,
  restoreRedux,
  registerReducers,
  getStore,
} from '@cdo/apps/redux';
import {
  NO_SECTION,
  selectSection,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

import fakeSectionData, {scriptId} from './fakeSectionData';

// some arbitrary data in a form we expect to receive from the server
// We get this from our call to /api/lock_status
const [section1Id, section2Id] = Object.keys(fakeSectionData);
const lesson1Id = Object.keys(fakeSectionData[section1Id].lessons)[0];

describe('lessonLockRedux reducer tests', () => {
  describe('setSectionLockStatus', () => {
    it('sets section data we receive from the server', () => {
      const action = setSectionLockStatus(fakeSectionData);
      const nextState = reducer({}, action);

      expect(nextState.lessonsBySectionId).toEqual({
        [section1Id]: fakeSectionData[section1Id].lessons,
        [section2Id]: fakeSectionData[section2Id].lessons,
      });
    });
  });

  describe('selectSection', () => {
    it('updates lock status', () => {
      let action, nextState;
      const sectionState = reducer(
        undefined,
        setSectionLockStatus(fakeSectionData)
      );

      // Open dialog, such that lockStatus represents section1
      action = openLockDialog(section1Id, lesson1Id);
      nextState = reducer(sectionState, action);
      expect(nextState.lockStatus.length).toEqual(3);

      // Now switch sections
      action = selectSection(section2Id);
      nextState = reducer(nextState, action);
      expect(nextState.lockStatus).toEqual([
        {
          name: 'student4',
          lockStatus: LockStatus.Locked,
          userLevelData:
            fakeSectionData[section2Id].lessons[lesson1Id][0].user_level_data,
        },
      ]);
    });

    it('clears lockStatus when selecting NO_SECTION', () => {
      let action, nextState;
      const sectionState = reducer(
        undefined,
        setSectionLockStatus(fakeSectionData)
      );

      // Open dialog, such that lockStatus represents section1
      action = openLockDialog(section1Id, lesson1Id);
      nextState = reducer(sectionState, action);
      expect(nextState.lockStatus.length).toEqual(3);

      // Now switch to NO_SECTION
      action = selectSection(NO_SECTION);
      nextState = reducer(nextState, action);
      expect(nextState.lockStatus).toEqual([]);
    });
  });

  describe('openLockDialog', () => {
    it('updates lock status and lockDialogLessonId', () => {
      const state = reducer(undefined, setSectionLockStatus(fakeSectionData));
      expect(state.lockStatus).toEqual([]);
      expect(state.lockDialogLessonId).toEqual(null);

      const action = openLockDialog(section1Id, lesson1Id);
      const nextState = reducer(state, action);
      expect(nextState.lockDialogLessonId).toEqual(lesson1Id);

      const student1 = fakeSectionData[section1Id].lessons[lesson1Id][0];
      const student2 = fakeSectionData[section1Id].lessons[lesson1Id][1];
      const student3 = fakeSectionData[section1Id].lessons[lesson1Id][2];
      const expected = [
        {
          userLevelData: student1.user_level_data,
          name: student1.name,
          lockStatus: LockStatus.Locked,
        },
        {
          userLevelData: student2.user_level_data,
          name: student2.name,
          lockStatus: LockStatus.Editable,
        },
        {
          userLevelData: student3.user_level_data,
          name: student3.name,
          lockStatus: LockStatus.ReadonlyAnswers,
        },
      ];
      expect(nextState.lockStatus).toEqual(expected);
    });
  });

  describe('closeLockDialog', () => {
    it('resets saving/lockStatus/lockDialogLessonId', () => {
      let state = reducer({}, setSectionLockStatus(fakeSectionData));
      state = reducer(state, openLockDialog(section1Id, lesson1Id));
      state = reducer(state, beginSave());

      const action = closeLockDialog();
      const nextState = reducer(state, action);
      expect(nextState.lockDialogLessonId).toEqual(null);
      expect(nextState.lockStatus).toEqual([]);
    });
  });

  describe('beginSave', () => {
    it('updates saving', () => {
      const initialState = reducer(undefined, {});
      expect(initialState.saving).toEqual(false);

      const action = beginSave();
      const nextState = reducer(initialState, action);
      expect(nextState.saving).toEqual(true);
    });
  });

  describe('finishSave', () => {
    it('updates both lockStatus, and the appropriate part of the info in sections', () => {
      let state = reducer(undefined, setSectionLockStatus(fakeSectionData));
      state = reducer(state, openLockDialog(section1Id, lesson1Id));
      state = reducer(state, beginSave());

      const student1LockStatus = state.lockStatus[0].lockStatus;
      const student2LockStatus = state.lockStatus[1].lockStatus;
      const student3LockStatus = state.lockStatus[2].lockStatus;
      expect(student1LockStatus).toEqual(LockStatus.Locked);
      expect(student2LockStatus).toEqual(LockStatus.Editable);
      expect(student3LockStatus).toEqual(LockStatus.ReadonlyAnswers);
      const student1 = state.lessonsBySectionId[section1Id][lesson1Id][0];
      const student2 = state.lessonsBySectionId[section1Id][lesson1Id][1];
      const student3 = state.lessonsBySectionId[section1Id][lesson1Id][2];
      expect(student1.locked).toEqual(true);
      expect(student1.readonly_answers).toEqual(false);
      expect(student2.locked).toEqual(false);
      expect(student2.readonly_answers).toEqual(false);
      expect(student3.locked).toEqual(false);
      expect(student3.readonly_answers).toEqual(true);

      let newLockStatus = _.cloneDeep(state.lockStatus);
      // swap students two and three in terms of lock status
      newLockStatus[1].lockStatus = LockStatus.ReadonlyAnswers;
      newLockStatus[2].lockStatus = LockStatus.Editable;
      const action = finishSave(section1Id, lesson1Id, newLockStatus);
      const nextState = reducer(state, action);

      const nextStudent1LockStatus = nextState.lockStatus[0].lockStatus;
      const nextStudent2LockStatus = nextState.lockStatus[1].lockStatus;
      const nextStudent3LockStatus = nextState.lockStatus[2].lockStatus;
      expect(nextStudent1LockStatus).toEqual(LockStatus.Locked);
      expect(nextStudent2LockStatus).toEqual(LockStatus.ReadonlyAnswers);
      expect(nextStudent3LockStatus).toEqual(LockStatus.Editable);
      const nextStudent1 =
        nextState.lessonsBySectionId[section1Id][lesson1Id][0];
      const nextStudent2 =
        nextState.lessonsBySectionId[section1Id][lesson1Id][1];
      const nextStudent3 =
        nextState.lessonsBySectionId[section1Id][lesson1Id][2];
      expect(nextStudent1.locked).toEqual(true);
      expect(nextStudent1.readonly_answers).toEqual(false);
      expect(nextStudent3.locked).toEqual(false);
      expect(nextStudent3.readonly_answers).toEqual(false);
      expect(nextStudent2.locked).toEqual(false);
      expect(nextStudent2.readonly_answers).toEqual(true);
    });
  });
});

describe('saveLockDialog', () => {
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
    registerReducers({lessonLock: reducerSpy});
    store = getStore();
  });

  afterEach(() => {
    restoreRedux();
    lastRequest = null;
    xhr.restore();
  });

  it('successfully saves via dialog', () => {
    store.dispatch(setSectionLockStatus(fakeSectionData));
    store.dispatch(openLockDialog(section1Id, lesson1Id));

    let newLockStatus = _.cloneDeep(store.getState().lessonLock.lockStatus);
    // swap students two and three in terms of lock status
    newLockStatus[1].lockStatus = LockStatus.ReadonlyAnswers;
    newLockStatus[2].lockStatus = LockStatus.Editable;

    reducerSpy.resetHistory();

    store.dispatch(saveLockDialog(section1Id, newLockStatus));

    const student2 = fakeSectionData[section1Id].lessons[lesson1Id][1];
    const student3 = fakeSectionData[section1Id].lessons[lesson1Id][2];

    const updates = JSON.parse(lastRequest.requestBody).updates;

    // Make sure we filtered out unchanged student (student1) and pass in the
    // right data
    expect(updates).toEqual([
      {
        user_level_data: student2.user_level_data,
        locked: false,
        readonly_answers: true,
      },
      {
        user_level_data: student3.user_level_data,
        locked: false,
        readonly_answers: false,
      },
    ]);

    lastRequest.respond(
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify({})
    );

    expect(reducerSpy.callCount).toEqual(3);

    const firstAction = reducerSpy.getCall(0).args[1];
    const secondAction = reducerSpy.getCall(1).args[1];
    const thirdAction = reducerSpy.getCall(2).args[1];

    expect(firstAction.type).toEqual(BEGIN_SAVE);
    expect(secondAction.type).toEqual(FINISH_SAVE);
    expect(thirdAction.type).toEqual(CLOSE_LOCK_DIALOG);
  });

  it('successfully lockLesson without dialog', () => {
    store.dispatch(setSectionLockStatus(fakeSectionData));

    reducerSpy.resetHistory();

    store.dispatch(lockLesson(section1Id, lesson1Id));

    const student1 = fakeSectionData[section1Id].lessons[lesson1Id][0];
    const student2 = fakeSectionData[section1Id].lessons[lesson1Id][1];
    const student3 = fakeSectionData[section1Id].lessons[lesson1Id][2];

    const updates = JSON.parse(lastRequest.requestBody).updates;

    expect(updates).toEqual([
      {
        user_level_data: student1.user_level_data,
        locked: true,
        readonly_answers: false,
      },
      {
        user_level_data: student2.user_level_data,
        locked: true,
        readonly_answers: false,
      },
      {
        user_level_data: student3.user_level_data,
        locked: true,
        readonly_answers: false,
      },
    ]);

    lastRequest.respond(
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify({})
    );

    expect(reducerSpy.callCount).toEqual(2);

    const firstAction = reducerSpy.getCall(0).args[1];
    const secondAction = reducerSpy.getCall(1).args[1];

    expect(firstAction.type).toEqual(BEGIN_SAVE);
    expect(secondAction.type).toEqual(FINISH_SAVE);
  });
});

describe('fullyLockedLessonMapping', () => {
  const sections = {
    // all lessons fully locked
    11: {
      1360: [
        {
          // Note: Actual state has more fields, I've filtered to just those
          // that we care about, for simplicity
          name: 'student1',
          locked: true,
        },
        {
          name: 'student2',
          locked: true,
        },
      ],
      1361: [
        {
          name: 'student1',
          locked: true,
        },
        {
          name: 'student2',
          locked: true,
        },
      ],
    },
    // no lessons fully locked
    12: {
      // some students are locked, others arent
      1360: [
        {
          name: 'student1',
          locked: false,
        },
        {
          name: 'student2',
          locked: true,
        },
      ],
      // entirely unlocked
      1361: [
        {
          name: 'student1',
          locked: false,
        },
        {
          name: 'student2',
          locked: false,
        },
      ],
    },
    // mix of fully locked lessons and not
    13: {
      1360: [
        {
          name: 'student1',
          locked: true,
        },
        {
          name: 'student2',
          locked: true,
        },
      ],
      // entirely unlocked
      1361: [
        {
          name: 'student1',
          locked: true,
        },
        {
          name: 'student2',
          locked: false,
        },
      ],
    },
  };

  it('maps to true for fully locked lessons', () => {
    expect(fullyLockedLessonMapping(sections['11'])).toEqual({
      1360: true,
      1361: true,
    });
  });

  it('maps to false for non-fully locked lessons', () => {
    expect(fullyLockedLessonMapping(sections['12'])).toEqual({
      1360: false,
      1361: false,
    });
  });

  it('works when some of our lessons are locked and others arent', () => {
    expect(fullyLockedLessonMapping(sections['13'])).toEqual({
      1360: true,
      1361: false,
    });
  });

  it('returns an empty object if no selectedSection', () => {
    expect(fullyLockedLessonMapping(sections['9999'])).toEqual({});
  });
});

describe('refetchSectionLockStatus', () => {
  let store;
  const lockStatusResponse = _.cloneDeep(fakeSectionData);
  lockStatusResponse[section1Id]['lessons'][lesson1Id][1].locked = true;

  // Intercept all XHR requests, storing the last one
  beforeEach(() => {
    stubRedux();
    registerReducers({lessonLock: reducer});
    store = getStore();

    sinon.stub($, 'ajax').returns({
      done: successCallback => {
        successCallback(lockStatusResponse);
        return {fail: () => {}};
      },
    });
  });

  afterEach(() => {
    restoreRedux();
    $.ajax.restore();
  });

  it('updates lessonsBySectionId', async () => {
    // Initial set up of lessonLockRedux with fakeSectionData
    store.dispatch(setSectionLockStatus(fakeSectionData));
    let student2 =
      store.getState().lessonLock.lessonsBySectionId[section1Id][lesson1Id][1];
    expect(student2.locked).toEqual(false);

    // Refetch lessonLock data with updated lock status for lesson1 student 2
    store.dispatch(refetchSectionLockStatus(section1Id, scriptId));
    student2 =
      store.getState().lessonLock.lessonsBySectionId[section1Id][lesson1Id][1];
    expect(student2.locked).toEqual(true);
  });
});
