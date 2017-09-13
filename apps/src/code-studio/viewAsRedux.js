/**
 * Reducer for tracking whether we're currently viewing the page as a student
 * or as a teacher
 */

import { makeEnum, reload } from '@cdo/apps/utils';
import { queryParams, updateQueryParam } from '@cdo/apps/code-studio/utils';

export const ViewType = makeEnum('Student', 'Teacher');

// Action types
export const SET_VIEW_TYPE = 'viewAs/SET_VIEW_TYPE';

/**
 * Stage lock reducer
 */
export default function reducer(state = ViewType.Student, action) {
  if (action.type === SET_VIEW_TYPE) {
    const viewType = action.viewType;
    if (!ViewType[viewType]) {
      throw new Error('unknown ViewType: ' + viewType);
    }

    return action.viewType;
  }

  return state;
}

// Action creators

// Exported for test purposes
export const setViewTypeNonThunk = viewType => ({
  type: SET_VIEW_TYPE,
  viewType
});

export const setViewType = viewType => {
  return dispatch => {
    // If changing to viewAs student while we are a particular student, remove
    // the user_id and do a reload so that we're instead viewing as a generic
    // student
    if (viewType === ViewType.Student && queryParams('user_id')) {
      updateQueryParam('user_id', undefined);
      // Make a stubbable call to window.location.reload
      reload();
      return;
    }

    dispatch(setViewTypeNonThunk(viewType));
  };
};
