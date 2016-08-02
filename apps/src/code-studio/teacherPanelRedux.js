/**
 * Reducer and actions for teacher panel
 */

// TODO - really this module is broader than just teacherPanel at this point.
// come up with a better name

import _ from 'lodash';
import { makeEnum } from '@cdo/apps/utils';

export const ViewType = makeEnum('Student', 'Teacher');
export const LockStatus = makeEnum('Locked', 'Editable', 'Readonly');

// Action types
const SET_VIEW_TYPE = 'teacherPanel/SET_VIEW_TYPE';
const SET_SECTIONS = 'teacherPanel/SET_SECTIONS';
const SELECT_SECTION = 'teacherPanel/SELECT_SECTION';
const OPEN_LOCK_DIALOG = 'teacherPanel/OPEN_LOCK_DIALOG';
const CLOSE_LOCK_DIALOG = 'teacherPanel/CLOSE_LOCK_DIALOG';
const BEGIN_SAVE = 'teacherPanel/BEGIN_SAVE';

const initialState = {
  viewAs: ViewType.Teacher,
  sections: {},
  selectedSection: null,
  sectionsLoaded: false,
  unlockedStageIds: [],
  lockDialogStageId: null,
  lockStatus: [],
  saving: false
};

/**
 * Teacher panel reducer
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
      unlockedStageIds: unlockedStages(currentSection)
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
      unlockedStageIds: unlockedStages(currentSection)
    });
  }

  if (action.type === OPEN_LOCK_DIALOG) {
    const { sections, selectedSection } = state;
    const lockDialogStageId = action.stageId;

    const students = sections[selectedSection].stages[lockDialogStageId];
    return Object.assign({}, state, {
      lockDialogStageId,
      lockStatus: students.map(student => ({
        userLevelId: student.user_level_id,
        name: student.name,
        lockStatus: student.locked ? LockStatus.Locked : (
          student.readonly ? LockStatus.Readonly : LockStatus.Editable)
      }))
    });
  }

  if (action.type === CLOSE_LOCK_DIALOG) {
    return Object.assign({}, state, {
      lockDialogStageId: null,
      saving: false
    });
  }

  if (action.type === BEGIN_SAVE) {
    return Object.assign({}, state, {
      saving: true
    });
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

export const beginSave = () => ({ type: BEGIN_SAVE });

export const saveLockDialog = () => {
  return dispatch => {
    dispatch(beginSave());
    $.post('/dashboardapi/lock_status',
    // TODO - post real data
      {
        updates: [{
          user_level_id: '123',
          locked: false,
          readonly: true
        }, {
          user_level_id: '456',
          locked: true,
          readonly: false
        }]
      }
    ).done(() => {
      console.log('success');
      dispatch(closeLockDialog());
    })
    .fail(err => {
      console.error('error');
    });
  };
};

export const closeLockDialog = () => ({
  type: CLOSE_LOCK_DIALOG
});

// Helpers
const unlockedStages = (section) => {
  return _.toPairs(section.stages).filter(([stageId, students]) => {
    return students.some(student => !student.locked);
  }).map(([stageId, stage]) => parseInt(stageId, 10));
};
