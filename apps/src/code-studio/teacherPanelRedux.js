/**
 * Reducer and actions for teacher panel
 */

import { makeEnum } from '@cdo/apps/utils';

export const ViewType = makeEnum('Student', 'Teacher');

// Action types
const SET_VIEW_TYPE = 'teacherPanel/SET_VIEW_TYPE';

const initialState = {
  viewAs: ViewType.Teacher
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
