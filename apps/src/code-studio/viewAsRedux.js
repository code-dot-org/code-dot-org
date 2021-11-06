/**
 * Reducer for tracking whether we're currently viewing the page as a participant
 * or as a instructor
 */

import {makeEnum, reload} from '@cdo/apps/utils';
import {queryParams, updateQueryParam} from '@cdo/apps/code-studio/utils';

export const ViewType = makeEnum('Participant', 'Instructor');

// Action types
export const SET_VIEW_TYPE = 'viewAs/SET_VIEW_TYPE';

export default function reducer(state = ViewType.Participant, action) {
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

export const setViewType = viewType => ({
  type: SET_VIEW_TYPE,
  viewType
});

export const changeViewType = viewType => {
  return dispatch => {
    if (viewType === ViewType.Participant && queryParams('user_id')) {
      updateQueryParam('user_id', undefined);
      // Make a stubbable call to window.location.reload
      reload();
      return;
    }
    // If changing to viewAs student while we are a particular student, remove
    // the user_id and do a reload so that we're instead viewing as a generic
    // student

    dispatch(setViewType(viewType));
  };
};
