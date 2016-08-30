import { assert } from 'chai';
import { createStore } from '@cdo/apps/redux';
import { combineReducers } from 'redux';
import _ from 'lodash';
import sinon from 'sinon';

import reducer, {
  initialState,
  ViewType,
  LockStatus,
  setViewType,
  setSections,
  selectSection,
  beginSave,
  finishSave,
  openLockDialog,
  closeLockDialog,
  saveLockDialog,
  lockStage,
  BEGIN_SAVE,
  FINISH_SAVE,
  CLOSE_LOCK_DIALOG,
  fullyLockedStageMapping
} from '@cdo/apps/code-studio/stageLockRedux';

// some arbitrary data in a form we expect to receive from the server
// We get this from our call to /api/lock_status
const section1Id = 42;
const section2Id = 43;
const stage1Id = 12;
const stage2Id = 13;

const fakeSectionData = {
  [section1Id]: {
    section_id: section1Id,
    section_name: 'My Section',
    stages: {
      [stage1Id]: [
        // locked
        {
          locked: true,
          name: 'student1',
          user_level_data: {
            user_id: 1001,
            level_id: 2000,
            script_id: 3000
          },
          readonly_answers: false
        },
        // unlocked
        {
          locked: false,
          name: 'student2',
          user_level_data: {
            user_id: 1002,
            level_id: 2000,
            script_id: 3000
          },
          readonly_answers: false
        },
        // view answers
        {
          locked: false,
          name: 'student3',
          user_level_data: {
            user_id: 1003,
            level_id: 2000,
            script_id: 3000
          },
          readonly_answers: true
        },
      ]
    }
  },
  [section2Id]: {
    section_id: section2Id,
    section_name: 'My Other Section',
    stages: {
      [stage2Id]: [
        {
          locked: true,
          name: 'student3',
          user_level_data: {
            user_id: 1003,
            level_id: 2000,
            script_id: 3000
          },
          readonly_answers: false
        }
      ]
    }
  }
};

describe('reducer tests', () => {
  describe('setViewType', () => {
    it('can set as teacher', () => {
      const action = setViewType(ViewType.Teacher);
      const nextState = reducer(initialState, action);
      assert.equal(nextState.viewAs, ViewType.Teacher);
    });

    it('can set as student', () => {
      const action = setViewType(ViewType.Student);
      const nextState = reducer(initialState, action);
      assert.equal(nextState.viewAs, ViewType.Student);
    });
  });

  describe('setSections', () => {
    it('sets section data we receive from the server', () => {
      const section1Id = Object.keys(fakeSectionData)[0];

      const action = setSections(fakeSectionData);
      assert.equal(initialState.sectionsLoaded, false);
      assert.equal(initialState.selectedSection, null);

      const nextState = reducer(initialState, action);
      assert.deepEqual(nextState.sections, fakeSectionData);
      assert.equal(nextState.sectionsLoaded, true);
      assert.equal(nextState.selectedSection, section1Id,
        'arbitrarily select the first section as selected');
    });
  });

  describe('selectSection', () => {
    it('can change the selected section', () => {
      const sectionState = reducer(initialState, setSections(fakeSectionData));
      assert.equal(sectionState.selectedSection, section1Id);

      const action = selectSection(section2Id);
      const nextState = reducer(sectionState, action);
      assert.equal(nextState.selectedSection, section2Id);
    });

    it('fails if we have no sections', () => {
      assert.equal(Object.keys(initialState.sections).length, 0);

      const action = selectSection(section1Id);
      assert.throws(() => {
        reducer(initialState, action);
      });
    });

    it('fails if we try selecting a non-existent section', () => {
      const sectionState = reducer(initialState, setSections(fakeSectionData));
      assert(Object.keys(sectionState.sections).length > 0);

      const action = selectSection(99999);
      assert.throws(() => {
        reducer(sectionState, action);
      });
    });
  });

  describe('openLockDialog', () => {
    it('updates lock status and lockDialogStageId', () => {
      const state = reducer(initialState, setSections(fakeSectionData));
      assert.deepEqual(state.lockStatus, []);
      assert.equal(state.lockDialogStageId, null);

      const action = openLockDialog(stage1Id);
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
      let state = reducer(initialState, setSections(fakeSectionData));
      state = reducer(state, openLockDialog(stage1Id));
      state = reducer(state, beginSave());

      const action = closeLockDialog();
      const nextState = reducer(state, action);
      assert.equal(nextState.lockDialogStageId, null);
      assert.deepEqual(nextState.lockStatus, []);
    });
  });

  describe('beginSave', () => {
    it('updates saving', () => {
      assert.equal(initialState.saving, false);
      const action = beginSave();
      const nextState = reducer(initialState, action);
      assert.equal(nextState.saving, true);
    });
  });

  describe('finishSave', () => {
    it('updates both lockStatus, and the appropriate part of the info in sectoins', () => {
      let state = reducer(initialState, setSections(fakeSectionData));
      state = reducer(state, openLockDialog(stage1Id));
      state = reducer(state, beginSave());

      const student1LockStatus = state.lockStatus[0].lockStatus;
      const student2LockStatus = state.lockStatus[1].lockStatus;
      const student3LockStatus = state.lockStatus[2].lockStatus;
      assert.equal(student1LockStatus, LockStatus.Locked);
      assert.equal(student2LockStatus, LockStatus.Editable);
      assert.equal(student3LockStatus, LockStatus.ReadonlyAnswers);
      const student1 = state.sections[section1Id].stages[stage1Id][0];
      const student2 = state.sections[section1Id].stages[stage1Id][1];
      const student3 = state.sections[section1Id].stages[stage1Id][2];
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
      const action = finishSave(newLockStatus, stage1Id);
      const nextState = reducer(state, action);

      const nextStudent1LockStatus = nextState.lockStatus[0].lockStatus;
      const nextStudent2LockStatus = nextState.lockStatus[1].lockStatus;
      const nextStudent3LockStatus = nextState.lockStatus[2].lockStatus;
      assert.equal(nextStudent1LockStatus, LockStatus.Locked);
      assert.equal(nextStudent2LockStatus, LockStatus.ReadonlyAnswers);
      assert.equal(nextStudent3LockStatus, LockStatus.Editable);
      const nextStudent1 = nextState.sections[section1Id].stages[stage1Id][0];
      const nextStudent2 = nextState.sections[section1Id].stages[stage1Id][1];
      const nextStudent3 = nextState.sections[section1Id].stages[stage1Id][2];
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
    store = createStore(combineReducers({stageLock: reducerSpy}));
  });

  afterEach(() => {
    lastRequest = null;
    xhr.restore();
  });

  it('successfully saves via dialog', () => {
    store.dispatch(setSections(fakeSectionData));
    store.dispatch(openLockDialog(stage1Id));

    let newLockStatus = _.cloneDeep(store.getState().stageLock.lockStatus);
    // swap students two and three in terms of lock status
    newLockStatus[1].lockStatus = LockStatus.ReadonlyAnswers;
    newLockStatus[2].lockStatus = LockStatus.Editable;

    reducerSpy.reset();

    store.dispatch(saveLockDialog(newLockStatus));

    const student1 = fakeSectionData[section1Id].stages[stage1Id][0];
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
    store.dispatch(setSections(fakeSectionData));

    reducerSpy.reset();

    store.dispatch(lockStage(stage1Id));

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
      section_id: 11,
      section_name: "fully locked",
      stages: {
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
      }
    },
    // no stages fully locked
    "12": {
      section_id: 12,
      section_name: "not fully locked",
      stages: {
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
      }
    },
    // mix of fully locked stages and not
    "13": {
      section_id: 12,
      section_name: "not fully locked",
      stages: {
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
    }
  };

  it('maps to true for fully locked stages', () => {
    const state = {
      sections: sections,
      selectedSection: "11"
    };
    assert.deepEqual(fullyLockedStageMapping(state), {
      "1360": true,
      "1361": true
    });
  });

  it('maps to false for non-fully locked stages', () => {
    const state = {
      sections: sections,
      selectedSection: "12"
    };
    assert.deepEqual(fullyLockedStageMapping(state), {
      "1360": false,
      "1361": false
    });
  });

  it('works when some of our stages are locked and others arent', () => {
    const state = {
      sections: sections,
      selectedSection: "13"
    };
    assert.deepEqual(fullyLockedStageMapping(state), {
      "1360": true,
      "1361": false
    });
  });

  it('returns an empty object if no selectedSection', () => {
    const state = {
      sections: sections,
      selectedSection: undefined
    };
    assert.deepEqual(fullyLockedStageMapping(state), {});
  });
});
