/**
 * Reducer and actions for stage lock info. This includes the teacher panel on
 * the course overview page, and the stage locking dialog.
 */

import { INIT_PROGRESS } from './progressRedux';
import experiments from '@cdo/apps/experiments';

export const TOGGLE_HIDDEN = 'hiddenStage/TOGGLE_HIDDEN';
export const HIDDEN_INITIALIZED = 'hiddenStage/HIDDEN_INITIALIZED';

export const hiddenStagesEnabled = () => experiments.isEnabled('hiddenStages');

// State is a key indicating whether or not we've received hidden stage info
// from the server, and then a set of stageIds mapped to bools that are true
// if that stage is hidden
const initialState = {
  initialized: false
};

/**
 * hidden stage reducer
 * Mapping of stage ids to bools indicating whether it's locked or not
 */
export default function reducer(state = {}, action) {
  // if (action.type === INIT_PROGRESS) {
  //   return {
  //     ...state,
  //     ...action.stages.reduce((obj, stage) => ({
  //       ...obj,
  //       [stage.id]: hiddenStagesEnabled() ? !!stage.hidden : false
  //     }), {})
  //   };
  // }

  if (action.type === TOGGLE_HIDDEN) {
    return {
      ...state,
      ...action.updates
    };
  }

  if (action.type === HIDDEN_INITIALIZED) {
    return {
      ...state,
      initialized: true
    };
  }

  return state;
}

// action creators
export function toggleHidden(stageId, hidden) {
  return {
    type: TOGGLE_HIDDEN,
    updates: {
      [stageId]: hidden
    }
  };
}

function hideStages(stageIds) {
  return {
    type: TOGGLE_HIDDEN,
    updates: stageIds.reduce((obj, id) => {
      return {
        ...obj,
        [id]: true
      };
    }, {})
  };
}

function hiddenInitialized() {
  return {
    type: HIDDEN_INITIALIZED
  };
}


export function getHiddenStages(scriptName) {
  return (dispatch, getState) => {
    if (!hiddenStagesEnabled()) {
      return;
    }

    $.ajax({
      type: 'GET',
      url: `/s/${scriptName}/hidden_stages`,
      dataType: 'json',
      contentType: 'application/json'
    }).done(hiddenStageIds => {
      dispatch(hideStages(hiddenStageIds));
      dispatch(hiddenInitialized());
    }).fail(err => {
      console.error(err);
    });
  };
}
