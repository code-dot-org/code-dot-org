import { assert } from 'chai';
import _ from 'lodash';
import sinon from 'sinon';
import fakeSectionData from './fakeSectionData';
import {stubRedux, restoreRedux, registerReducers, getStore} from '@cdo/apps/redux';
import { NO_SECTION, selectSection } from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import reducer, {
  LockStatus,
  beginSave,
  finishSave,
  openLockDialog,
  closeLockDialog,
  saveLockDialog,
  lockStage,
  BEGIN_SAVE,
  FINISH_SAVE,
  CLOSE_LOCK_DIALOG,
  fullyLockedStageMapping,
  setSectionLockStatus,
} from '@cdo/apps/code-studio/stageLockRedux';

// some arbitrary data in a form we expect to receive from the server
// We get this from our call to /api/lock_status
const [section1Id, section2Id] = Object.keys(fakeSectionData);
const stage1Id = Object.keys(fakeSectionData[section1Id].stages)[0];

describe('stageLockRedux reducer tests', () => {
  describe('setSectionLockStatus', () => {
    it('sets section data we receive from the server', () => {
      const action = setSectionLockStatus(fakeSectionData);
      const nextState = reducer({}, action);

      assert.deepEqual(nextState.stagesBySectionId, {
        [section1Id]: fakeSectionData[section1Id].stages,
        [section2Id]: fakeSectionData[section2Id].stages
      });
    });
  });

  describe('selectSection', () => {
    it('updates lock status', () => {
      let action, nextState;
      const sectionState = reducer(undefined, setSectionLockStatus(fakeSectionData));

      // Open dialog, such that lockStatus represents section1
      action = openLockDialog(section1Id, stage1Id);
      nextState = reducer(sectionState, action);
      assert.equal(nextState.lockStatus.length, 3);

      // Now switch sections
      action = selectSection(section2Id);
      nextState = reducer(nextState, action);
      assert.deepEqual(nextState.lockStatus, [{
        name: 'student4',
        lockStatus: LockStatus.Locked,
        userLevelData: fakeSectionData[section2Id].stages[stage1Id][0].user_level_data
      }]);
    });

    it('clears lockStatus when selecting NO_SECTION', () => {
      let action, nextState;
      const sectionState = reducer(undefined, setSectionLockStatus(fakeSectionData));

      // Open dialog, such that lockStatus represents section1
      action = openLockDialog(section1Id, stage1Id);
      nextState = reducer(sectionState, action);
      assert.equal(nextState.lockStatus.length, 3);

      // Now switch to NO_SECTION
      action = selectSection(NO_SECTION);
      nextState = reducer(nextState, action);
      assert.deepEqual(nextState.lockStatus, []);
    });
  });

  describe('openLockDialog', () => {
    it('updates lock status and lockDialogStageId', () => {
      const state = reducer(undefined, setSectionLockStatus(fakeSectionData));
      assert.deepEqual(state.lockStatus, []);
      assert.equal(state.lockDialogStageId, null);

      const action = openLockDialog(section1Id, stage1Id);
      const nextState = reducer(state, action);
      assert.equal(nextState.lockDialogStageId, stage1Id);

      const student1 = fakeSectionData[section1Id].stages[stage1Id][0];
      const student2 = fakeSectionData[section1Id].stages[stage1Id][1];
      const student3 = fakeSectionData[section1Id].stages[stage1Id][2];
      const expected = [
        {
          userLevelData: student1.user_level_data,
          name: student1.name,
          lockStatus: LockStatus.Locked
        },
        {
          userLevelData: student2.user_level_data,
          name: student2.name,
          lockStatus: LockStatus.Editable
        },
        {
          userLevelData: student3.user_level_data,
          name: student3.name,
          lockStatus: LockStatus.ReadonlyAnswers
        }
      ];
      assert.deepEqual(nextState.lockStatus, expected);
    });
  });

  describe('closeLockDialog', () => {
    it('resets saving/lockStatus/lockDialogStageId', () => {
      let state = reducer({}, setSectionLockStatus(fakeSectionData));
      state = reducer(state, openLockDialog(section1Id, stage1Id));
      state = reducer(state, beginSave());

      const action = closeLockDialog();
      const nextState = reducer(state, action);
      assert.equal(nextState.lockDialogStageId, null);
      assert.deepEqual(nextState.lockStatus, []);
    });
  });

  describe('beginSave', () => {
    it('updates saving', () => {
      const initialState = reducer(undefined, {});
      assert.equal(initialState.saving, false);

      const action = beginSave();
      const nextState = reducer(initialState, action);
      assert.equal(nextState.saving, true);
    });
  });

  describe('finishSave', () => {
    it('updates both lockStatus, and the appropriate part of the info in sections', () => {
      let state = reducer(undefined, setSectionLockStatus(fakeSectionData));
      state = reducer(state, openLockDialog(section1Id, stage1Id));
      state = reducer(state, beginSave());

      const student1LockStatus = state.lockStatus[0].lockStatus;
      const student2LockStatus = state.lockStatus[1].lockStatus;
      const student3LockStatus = state.lockStatus[2].lockStatus;
      assert.equal(student1LockStatus, LockStatus.Locked);
      assert.equal(student2LockStatus, LockStatus.Editable);
      assert.equal(student3LockStatus, LockStatus.ReadonlyAnswers);
      const student1 = state.stagesBySectionId[section1Id][stage1Id][0];
      const student2 = state.stagesBySectionId[section1Id][stage1Id][1];
      const student3 = state.stagesBySectionId[section1Id][stage1Id][2];
      assert.equal(student1.locked, true);
      assert.equal(student1.readonly_answers, false);
      assert.equal(student2.locked, false);
      assert.equal(student2.readonly_answers, false);
      assert.equal(student3.locked, false);
      assert.equal(student3.readonly_answers, true);

      let newLockStatus = _.cloneDeep(state.lockStatus);
      // swap students two and three in terms of lock status
      newLockStatus[1].lockStatus = LockStatus.ReadonlyAnswers;
      newLockStatus[2].lockStatus = LockStatus.Editable;
      const action = finishSave(section1Id, stage1Id, newLockStatus);
      const nextState = reducer(state, action);

      const nextStudent1LockStatus = nextState.lockStatus[0].lockStatus;
      const nextStudent2LockStatus = nextState.lockStatus[1].lockStatus;
      const nextStudent3LockStatus = nextState.lockStatus[2].lockStatus;
      assert.equal(nextStudent1LockStatus, LockStatus.Locked);
      assert.equal(nextStudent2LockStatus, LockStatus.ReadonlyAnswers);
      assert.equal(nextStudent3LockStatus, LockStatus.Editable);
      const nextStudent1 = nextState.stagesBySectionId[section1Id][stage1Id][0];
      const nextStudent2 = nextState.stagesBySectionId[section1Id][stage1Id][1];
      const nextStudent3 = nextState.stagesBySectionId[section1Id][stage1Id][2];
      assert.equal(nextStudent1.locked, true);
      assert.equal(nextStudent1.readonly_answers, false);
      assert.equal(nextStudent3.locked, false);
      assert.equal(nextStudent3.readonly_answers, false);
      assert.equal(nextStudent2.locked, false);
      assert.equal(nextStudent2.readonly_answers, true);
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
    registerReducers({stageLock: reducerSpy});
    store = getStore();
  });

  afterEach(() => {
    restoreRedux();
    lastRequest = null;
    xhr.restore();
  });

  it('successfully saves via dialog', () => {
    store.dispatch(setSectionLockStatus(fakeSectionData));
    store.dispatch(openLockDialog(section1Id, stage1Id));

    let newLockStatus = _.cloneDeep(store.getState().stageLock.lockStatus);
    // swap students two and three in terms of lock status
    newLockStatus[1].lockStatus = LockStatus.ReadonlyAnswers;
    newLockStatus[2].lockStatus = LockStatus.Editable;

    reducerSpy.reset();

    store.dispatch(saveLockDialog(section1Id, newLockStatus));

    const student2 = fakeSectionData[section1Id].stages[stage1Id][1];
    const student3 = fakeSectionData[section1Id].stages[stage1Id][2];

    const updates = JSON.parse(lastRequest.requestBody).updates;

    // Make sure we filtered out unchanged student (student1) and pass in the
    // right data
    assert.deepEqual(updates, [
      {
        user_level_data: student2.user_level_data,
        locked: false,
        readonly_answers: true
      },
      {
        user_level_data: student3.user_level_data,
        locked: false,
        readonly_answers: false
      }
    ]);

    lastRequest.respond(200, { 'Content-Type': 'application/json' }, JSON.stringify({}));

    assert.equal(reducerSpy.callCount, 3);

    const firstAction = reducerSpy.getCall(0).args[1];
    const secondAction = reducerSpy.getCall(1).args[1];
    const thirdAction = reducerSpy.getCall(2).args[1];

    assert.equal(firstAction.type, BEGIN_SAVE);
    assert.equal(secondAction.type, FINISH_SAVE);
    assert.equal(thirdAction.type, CLOSE_LOCK_DIALOG);

  });

  it('successfully lockStage without dialog', () => {
    store.dispatch(setSectionLockStatus(fakeSectionData));

    reducerSpy.reset();

    store.dispatch(lockStage(section1Id, stage1Id));

    const student1 = fakeSectionData[section1Id].stages[stage1Id][0];
    const student2 = fakeSectionData[section1Id].stages[stage1Id][1];
    const student3 = fakeSectionData[section1Id].stages[stage1Id][2];

    const updates = JSON.parse(lastRequest.requestBody).updates;

    assert.deepEqual(updates, [
      {
        user_level_data: student1.user_level_data,
        locked: true,
        readonly_answers: false
      },
      {
        user_level_data: student2.user_level_data,
        locked: true,
        readonly_answers: false
      },
      {
        user_level_data: student3.user_level_data,
        locked: true,
        readonly_answers: false
      }
    ]);

    lastRequest.respond(200, { 'Content-Type': 'application/json' }, JSON.stringify({}));

    assert.equal(reducerSpy.callCount, 2);

    const firstAction = reducerSpy.getCall(0).args[1];
    const secondAction = reducerSpy.getCall(1).args[1];

    assert.equal(firstAction.type, BEGIN_SAVE);
    assert.equal(secondAction.type, FINISH_SAVE);
  });
});

describe('fullyLockedStageMapping', () => {
  const sections = {
    // all stages fully locked
    "11": {
      "1360": [{
        // Note: Actual state has more fields, I've filtered to just those
        // that we care about, for simplicity
        name: 'student1',
        locked: true
      }, {
        name: 'student2',
        locked: true
      }],
      "1361": [{
        name: 'student1',
        locked: true
      }, {
        name: 'student2',
        locked: true
      }],
    },
    // no stages fully locked
    "12": {
      // some students are locked, others arent
      "1360": [{
        name: 'student1',
        locked: false
      }, {
        name: 'student2',
        locked: true
      }],
      // entirely unlocked
      "1361": [{
        name: 'student1',
        locked: false
      }, {
        name: 'student2',
        locked: false
      }]
    },
    // mix of fully locked stages and not
    "13": {
      "1360": [{
        name: 'student1',
        locked: true
      }, {
        name: 'student2',
        locked: true
      }],
      // entirely unlocked
      "1361": [{
        name: 'student1',
        locked: true
      }, {
        name: 'student2',
        locked: false
      }]
    }
  };

  it('maps to true for fully locked stages', () => {
    assert.deepEqual(fullyLockedStageMapping(sections["11"]), {
      "1360": true,
      "1361": true
    });
  });

  it('maps to false for non-fully locked stages', () => {
    assert.deepEqual(fullyLockedStageMapping(sections["12"]), {
      "1360": false,
      "1361": false
    });
  });

  it('works when some of our stages are locked and others arent', () => {
    assert.deepEqual(fullyLockedStageMapping(sections["13"]), {
      "1360": true,
      "1361": false
    });
  });

  it('returns an empty object if no selectedSection', () => {
    assert.deepEqual(fullyLockedStageMapping(sections["9999"]), {});
  });
});
