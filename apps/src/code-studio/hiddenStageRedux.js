/**
 * Reducer and actions for stage lock info. This includes the teacher panel on
 * the course overview page, and the stage locking dialog.
 */
import $ from 'jquery';
import { INIT_PROGRESS } from './progressRedux';
import experiments from '@cdo/apps/experiments';

export const UPDATE_HIDDEN_STAGES = 'hiddenStage/UPDATE_HIDDEN_STAGES';
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
export default function reducer(state = initialState, action) {
  // TODO - make sure things still work when using via UI and not just tests
  if (action.type === UPDATE_HIDDEN_STAGES) {
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
export function updateHiddenStages(updates) {
  return {
    type: UPDATE_HIDDEN_STAGES,
    updates
  };
}

export function toggleHidden(scriptName, stageId, hidden) {
  return (dispatch, getState) => {
    // update local state
    dispatch(updateHiddenStages({
      [stageId]: hidden
    }));

    const sectionId = getState().stageLock.selectedSection;

    // update the server. note: we don't do anything differently if it succeeds
    // or fails
    $.ajax({
      type: 'POST',
      url: `/s/${scriptName}/toggle_hidden`,
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify({
        section_id: sectionId,
        stage_id: stageId,
        hidden
      })
    });
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
      // send updates for all stageIds, setting hidden to true
      const updates = hiddenStageIds.reduce((obj, id) => {
        return {
          ...obj,
          [id]: true
        };
      }, {});
      dispatch(updateHiddenStages(updates));
      dispatch(hiddenInitialized());
    }).fail(err => {
      console.error(err);
    });
  };
}
