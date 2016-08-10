import { assert } from 'chai';
import _ from 'lodash';

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
  closeLockDialog
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
          view_answers: false
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
          view_answers: false
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
          view_answers: true
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
          view_answers: false
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
          lockStatus: LockStatus.ViewAnswers
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
      assert.equal(nextState.saving, false);
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
      state = reducer(state, beginSave);

      const student1LockStatus = state.lockStatus[0].lockStatus;
      const student2LockStatus = state.lockStatus[1].lockStatus;
      const student3LockStatus = state.lockStatus[2].lockStatus;
      assert.equal(student1LockStatus, LockStatus.Locked);
      assert.equal(student2LockStatus, LockStatus.Editable);
      assert.equal(student3LockStatus, LockStatus.ViewAnswers);
      const student1 = state.sections[section1Id].stages[stage1Id][0];
      const student2 = state.sections[section1Id].stages[stage1Id][1];
      const student3 = state.sections[section1Id].stages[stage1Id][2];
      assert.equal(student1.locked, true);
      assert.equal(student1.view_answers, false);
      assert.equal(student2.locked, false);
      assert.equal(student2.view_answers, false);
      assert.equal(student3.locked, false);
      assert.equal(student3.view_answers, true);

      let newLockStatus = _.cloneDeep(state.lockStatus);
      // swap students two and three in terms of lock status
      newLockStatus[1].lockStatus = LockStatus.ViewAnswers;
      newLockStatus[2].lockStatus = LockStatus.Editable;
      const action = finishSave(newLockStatus, stage1Id);
      const nextState = reducer(state, action);

      const nextStudent1LockStatus = nextState.lockStatus[0].lockStatus;
      const nextStudent2LockStatus = nextState.lockStatus[1].lockStatus;
      const nextStudent3LockStatus = nextState.lockStatus[2].lockStatus;
      assert.equal(nextStudent1LockStatus, LockStatus.Locked);
      assert.equal(nextStudent2LockStatus, LockStatus.ViewAnswers);
      assert.equal(nextStudent3LockStatus, LockStatus.Editable);
      const nextStudent1 = nextState.sections[section1Id].stages[stage1Id][0];
      const nextStudent2 = nextState.sections[section1Id].stages[stage1Id][1];
      const nextStudent3 = nextState.sections[section1Id].stages[stage1Id][2];
      assert.equal(nextStudent1.locked, true);
      assert.equal(nextStudent1.view_answers, false);
      assert.equal(nextStudent3.locked, false);
      assert.equal(nextStudent3.view_answers, false);
      assert.equal(nextStudent2.locked, false);
      assert.equal(nextStudent2.view_answers, true);
    });
  });
});
