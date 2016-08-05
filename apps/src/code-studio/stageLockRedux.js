/**
 * Reducer and actions for stage lock info. This includes the teacher panel on
 * the course overview page, and the stage locking dialog.
 */

import _ from 'lodash';
import { makeEnum } from '@cdo/apps/utils';

export const ViewType = makeEnum('Student', 'Teacher');
export const LockStatus = makeEnum('Locked', 'Editable', 'Readonly');

// Action types
const SET_VIEW_TYPE = 'stageLock/SET_VIEW_TYPE';
const SET_SECTIONS = 'stageLock/SET_SECTIONS';
const SELECT_SECTION = 'stageLock/SELECT_SECTION';
const OPEN_LOCK_DIALOG = 'stageLock/OPEN_LOCK_DIALOG';
const CLOSE_LOCK_DIALOG = 'stageLock/CLOSE_LOCK_DIALOG';
const BEGIN_SAVE = 'stageLock/BEGIN_SAVE';
const FINISH_SAVE = 'stageLock/FINISH_SAVE';

const initialState = {
  viewAs: ViewType.Teacher,
  sections: {},
  selectedSection: null,
  sectionsLoaded: false,
  lockDialogStageId: null,
  // The locking info for the currently selected section/stage
  lockStatus: [],
  saving: false
};

/**
 * Stage lock reducer
 */
export default function reducer(state = initialState, action) {
  if (action.type === SET_VIEW_TYPE) {
    return Object.assign({}, state, {
      viewAs: action.viewAs
    });
  }

  if (action.type === SET_SECTIONS) {
    const sectionId = Object.keys(action.sections)[0];
    const currentSection = action.sections[sectionId];
    return Object.assign({}, state, {
      sections: action.sections,
      sectionsLoaded: true,
      selectedSection: sectionId,
    });
  }

  if (action.type === SELECT_SECTION) {
    const sectionId = action.sectionId;
    if (!state.sections[sectionId]) {
      throw new Error(`Unknown sectionId ${sectionId}`);
    }
    const currentSection = state.sections[sectionId];
    return Object.assign({}, state, {
      selectedSection: sectionId,
    });
  }

  if (action.type === OPEN_LOCK_DIALOG) {
    const { sections, selectedSection } = state;
    const lockDialogStageId = action.stageId;

    const students = sections[selectedSection].stages[lockDialogStageId];
    return Object.assign({}, state, {
      lockDialogStageId,
      lockStatus: lockStatusForStage(state, action.stageId)
    });
  }

  if (action.type === CLOSE_LOCK_DIALOG) {
    return Object.assign({}, state, {
      lockDialogStageId: null,
      lockStatus: [],
      saving: false
    });
  }

  if (action.type === BEGIN_SAVE) {
    return Object.assign({}, state, {
      saving: true
    });
  }

  if (action.type === FINISH_SAVE) {
    const { sections, selectedSection } = state;
    const { lockStatus: nextLockStatus, stageId } = action;
    const nextStage = _.cloneDeep(sections[selectedSection].stages[stageId]);

    // Update locked/view_answers in stages based on the new lockStatus provided
    // by our dialog.
    nextStage.forEach((item, index) => {
      const update = nextLockStatus[index];
      // We assume lockStatus is ordered the same as stageToUpdate. Let's
      // validate that.
      if (item.user_level_id !== update.userLevelId) {
        throw new Error('Expect user ids be the same');
      }
      item.locked = update.lockStatus === LockStatus.Locked;
      item.view_answers = update.lockStatus === LockStatus.Readonly;
    });

    const nextState = _.cloneDeep(state);
    nextState.sections[selectedSection].stages[stageId] = nextStage;
    nextState.lockStatus = nextLockStatus;
    return nextState;
  }

  return state;
}

// Action creators
export const setViewType = viewType => {
  if (!ViewType[viewType]) {
    throw new Error('unknown ViewType: ' + viewType);
  }

  return {
    type: SET_VIEW_TYPE,
    viewAs: viewType
  };
};

export const setSections = sections => ({
  type: SET_SECTIONS,
  sections
});

export const selectSection = sectionId => ({
  type: SELECT_SECTION,
  sectionId
});

export const openLockDialog = stageId => ({
  type: OPEN_LOCK_DIALOG,
  stageId
});

const beginSave = () => ({ type: BEGIN_SAVE });
const finishSave = (newLockStatus, stageId) => ({
  type: FINISH_SAVE,
  lockStatus: newLockStatus,
  stageId
});

/**
 * Action asynchronously dispatches a set of actions around saving our
 * lock status.
 */
const performSave = (newLockStatus, stageId) => {
  return (dispatch, getState) => {
    const oldLockStatus = getState().stageLock.lockStatus;

    const saveData = newLockStatus.filter((item, index) => {
      // Only need to save items that changed
      return !_.isEqual(item, oldLockStatus[index]);
    }).map(item => ({
      user_level_id: item.userLevelId,
      locked: item.lockStatus === LockStatus.Locked,
      view_answers: item.lockStatus === LockStatus.Readonly
    }));

    if (saveData.length === 0) {
      dispatch(closeLockDialog());
      return;
    }

    dispatch(beginSave());
    $.ajax({
      type: 'POST',
      url: '/api/lock_status',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify({updates: saveData})
    }).done(() => {
      dispatch(finishSave(newLockStatus, stageId));
      dispatch(closeLockDialog());
    })
    .fail(err => {
      console.error(err);
      dispatch(closeLockDialog());
    });
  };
};

export const saveLockDialog = (newLockStatus) => {
  return (dispatch, getState) => {
    const stageId = getState().stageLock.lockDialogStageId;
    dispatch(performSave(newLockStatus, stageId));
  };
};

export const lockStage = (stageId) => {
  return (dispatch, getState) => {
    const oldLockStatus = lockStatusForStage(getState().stageLock, stageId);
    const newLockStatus = oldLockStatus.map(student => Object.assign({}, student, {
      lockStatus: LockStatus.Locked
    }));
    dispatch(performSave(newLockStatus, stageId));
  };
};

export const closeLockDialog = () => ({
  type: CLOSE_LOCK_DIALOG
});

// Helpers

/**
 * Given the info for a particular section, find the set of stages that are not
 * fully locked (i.e. there is at least one student who is not locked), and
 * return their ids.
 */
const unlockedStages = (section) => {
  if (!section) {
    return [];
  }
  return _.toPairs(section.stages).filter(([stageId, students]) => {
    return students.some(student => !student.locked);
  }).map(([stageId, stage]) => parseInt(stageId, 10));
};

const lockStatusForStage = (state, stageId) => {
  const { sections, selectedSection } = state;

  const students = sections[selectedSection].stages[stageId];
  return students.map(student => ({
    userLevelId: student.user_level_id,
    name: student.name,
    lockStatus: student.locked ? LockStatus.Locked : (
      student.view_answers ? LockStatus.Readonly : LockStatus.Editable)
  }));
};
