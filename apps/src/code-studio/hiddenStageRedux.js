/**
 * Reducer and actions used to track what sections/scripts are are hidden on a
 * per section basis.
 */
import $ from 'jquery';
import Immutable from 'immutable';

// TODO: rename file to hiddenBySection
// TODO: rename action prefix

export const UPDATE_HIDDEN_STAGE = 'hiddenStage/UPDATE_HIDDEN_STAGE';
export const SET_INITIALIZED = 'hiddenStage/SET_INITIALIZED';

const STUDENT_SECTION_ID = 'STUDENT';

const HiddenState = Immutable.Record({
  // TODO: do we need separate initialized bools for stages/scripts
  initialized: false,
  hideableStagesAllowed: false,
  // mapping of section id to hidden stages for that section
  // Teachers will potentially have a number of section ids. For students we
  // use a sectionId of STUDENT_SECTION_ID, which represents the hidden state
  // for the student based on the sections they are in.
  bySection: Immutable.Map({
    // [sectionId]: {
    //   [stageId]: true
    // }
  })
});

/**
 * hidden stage reducer
 * Mapping of stage ids to bools indicating whether it's hidden or not
 */
export default function reducer(state = new HiddenState(), action) {
  if (action.type === UPDATE_HIDDEN_STAGE) {
    const { sectionId, stageId, hidden } = action;
    const nextState = state.setIn(['bySection', sectionId, stageId.toString()], hidden);
    if (state.getIn(['bySection', STUDENT_SECTION_ID]) &&
        state.get('bySection').size > 1) {
      throw new Error('Should never have STUDENT_SECTION_ID alongside other sectionIds');
    }
    return nextState;
  }

  if (action.type === SET_INITIALIZED) {
    return state.merge({
      initialized: true,
      hideableStagesAllowed: action.hideableStagesAllowed
    });
  }

  return state;
}

// action creators
export function updateHiddenStage(sectionId, stageId, hidden) {
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

export function setInitialized(hideableStagesAllowed) {
  return {
    type: SET_INITIALIZED,
    hideableStagesAllowed
  };
}

/**
 * Query server for hidden stage ids, and (potentially) toggle whether or not we
 * are able to mark stages as hideable.
 * @param {string} scriptName
 * @param {boolean} canHideStages If true, inform redux that we're able to toggle
 *   whether or not stages are hidden.
 */
export function getHiddenStages(scriptName, canHideStages) {
  return dispatch => {
    $.ajax({
      type: 'GET',
      url: `/s/${scriptName}/hidden_stages`,
      dataType: 'json',
      contentType: 'application/json'
    }).done(response => {
      // For a teacher, we get back a map of section id to hidden stage ids
      // For a student, we just get back a list of hidden stage ids. Turn that
      // into an object, under the 'sectionId' of STUDENT_SECTION_ID
      if (Array.isArray(response)) {
        response = { [STUDENT_SECTION_ID]: response };
      }

      Object.keys(response).forEach(sectionId => {
        const hiddenStageIds = response[sectionId];
        hiddenStageIds.forEach(stageId => {
          dispatch(updateHiddenStage(sectionId, stageId, true));
        });
      });
      dispatch(setInitialized(!!canHideStages));
    }).fail(err => {
      console.error(err);
    });
  };
}

// utils

/**
 * Helper to determine whether a stage is hidden for a given section. If no
 * section is given, we assume this is a student and use STUDENT_SECTION_ID
 */
export function isHiddenForSection(state, sectionId, stageId) {
  if (!stageId) {
    return false;
  }
  // if we don't have a sectionId, we must be a student
  if (!sectionId){
    sectionId = STUDENT_SECTION_ID;
  }
  const bySection = state.get('bySection');
  return !!bySection.getIn([sectionId, stageId.toString()]);
}
