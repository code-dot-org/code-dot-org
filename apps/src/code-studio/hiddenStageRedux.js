/**
 * Reducer and actions for stage lock info. This includes the teacher panel on
 * the course overview page, and the stage locking dialog.
 */
import $ from 'jquery';
import { INIT_PROGRESS } from './progressRedux';
import experiments from '@cdo/apps/experiments';
import Immutable from 'immutable';

export const UPDATE_HIDDEN_STAGE = 'hiddenStage/UPDATE_HIDDEN_STAGE';
export const ALLOW_HIDEABLE = 'hiddenStage/ALLOW_HIDEABLE';

export const hiddenStagesEnabled = () => experiments.isEnabled('hiddenStages');

const initialState = Immutable.fromJS({
  initialized: false,
  // mapping of section id to hidden stages for that section
  // in the case of a student, this will just be a mapping from undefined to
  // the stages hidden for that student
  bySection: {
    // [sectionId]: {
    //   [stageId]: true
    // }
  }
});

/**
 * hidden stage reducer
 * Mapping of stage ids to bools indicating whether it's locked or not
 */
export default function reducer(state = initialState, action) {
  if (action.type === UPDATE_HIDDEN_STAGE) {
    const { sectionId, stageId, hidden } = action;
    return state.setIn(['bySection', sectionId, stageId], hidden);
  }

  if (action.type === ALLOW_HIDEABLE) {
    return state.set('initialized', true);
  }

  return state;
}

// action creators
function updateHiddenStage(sectionId, stageId, hidden) {
  return {
    type: UPDATE_HIDDEN_STAGE,
    sectionId,
    stageId,
    hidden
  };
}

export function toggleHidden(scriptName, sectionId, stageId, hidden) {
  return (dispatch, getState) => {
    // update local state
    dispatch(updateHiddenStage(sectionId, stageId, hidden));

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

export function allowHideable() {
  return {
    type: ALLOW_HIDEABLE
  };
}


export function getHiddenStages(scriptName) {
  return (dispatch) => {
    if (!hiddenStagesEnabled()) {
      return;
    }

    $.ajax({
      type: 'GET',
      url: `/s/${scriptName}/hidden_stages`,
      dataType: 'json',
      contentType: 'application/json'
    }).done(response => {
      console.log('allow hideable');
      dispatch(allowHideable());

      // For a teacher, we get back a map of section id to hidden stage ids
      // For a student, we just get back a list of hidden stage ids. Turn that
      // into an object.
      if (Array.isArray(response)) {
        response = { undefined: response };
      }

      Object.keys(response).forEach(sectionId => {
        const hiddenStageIds = response[sectionId];
        hiddenStageIds.forEach(stageId => {
          dispatch(updateHiddenStage(sectionId, stageId, true));
        });
      });
    }).fail(err => {
      console.error(err);
    });
  };
}
