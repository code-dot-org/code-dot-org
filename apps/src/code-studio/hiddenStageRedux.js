/**
 * Reducer and actions used to track what sections/scripts are are hidden on a
 * per section basis.
 */
import $ from 'jquery';
import Immutable from 'immutable';

// TODO: rename file to hiddenBySection
// TODO: rename action prefix

const SET_HIDDEN_STAGES = 'hiddenStage/SET_HIDDEN_STAGES';
const UPDATE_HIDDEN_STAGE = 'hiddenStage/UPDATE_HIDDEN_STAGE';
const UPDATE_HIDDEN_SCRIPT = 'hiddenStage/UPDATE_HIDDEN_SCRIPT';

export const STUDENT_SECTION_ID = 'STUDENT';

const HiddenState = Immutable.Record({
  hiddenStagesInitialized: false,
  hideableStagesAllowed: false,
  // A mapping, where the key is the sectionId, and the value is a mapping from
  // stageId to a bool indicating whether that stage is hidden (true) or not (false)
  // Teachers will potentially have a number of section ids. For students we
  // use a sectionId of STUDENT_SECTION_ID, which represents the hidden state
  // for the student based on the sections they are in.
  stagesBySection: Immutable.Map({
    // [sectionId]: {
    //   [stageId]: true
    // }
  }),
  // Same as above but for hiding scripts in a section instead of stages
  scriptsBySection: Immutable.Map({
    // [sectionId]: {
    //   [scriptId]: true
    // }
  })
});

/**
 * Validates that we never have multiple stagesBySection if we have STUDENT_SECTION_ID
 * @throws If new state is invalid
 */
function validateSectionIds(state) {
  if (
    state.getIn(['stagesBySection', STUDENT_SECTION_ID]) &&
    state.get('stagesBySection').size > 1
  ) {
    throw new Error(
      'Should never have STUDENT_SECTION_ID alongside other sectionIds'
    );
  }
}

/**
 * Hidden stage reducer
 */
export default function reducer(state = new HiddenState(), action) {
  if (action.type === SET_HIDDEN_STAGES) {
    const {hiddenStagesPerSection, hideableStagesAllowed} = action;

    // Iterate through each section
    const sectionIds = Object.keys(hiddenStagesPerSection);
    let nextState = state;
    sectionIds.forEach(sectionId => {
      // And iterate through each hidden stage within that section
      const hiddenStageIds = hiddenStagesPerSection[sectionId];
      hiddenStageIds.forEach(stageId => {
        nextState = nextState.setIn(
          ['stagesBySection', sectionId, stageId.toString()],
          true
        );
      });
    });
    validateSectionIds(nextState);

    return nextState.merge({
      hiddenStagesInitialized: true,
      hideableStagesAllowed
    });
  }

  if (action.type === UPDATE_HIDDEN_STAGE) {
    const {sectionId, stageId, hidden} = action;
    const nextState = state.setIn(
      ['stagesBySection', sectionId, stageId.toString()],
      hidden
    );
    validateSectionIds(nextState);
    return nextState;
  }

  if (action.type === UPDATE_HIDDEN_SCRIPT) {
    const {sectionId, scriptId, hidden} = action;
    const nextState = state.setIn(
      ['scriptsBySection', sectionId.toString(), scriptId.toString()],
      hidden
    );
    validateSectionIds(nextState);
    return nextState;
  }

  return state;
}

// action creators

/**
 * @param {object} hiddenStagesPerSection - Mapping from sectionId to a list of stageIds
 *   that are hidden for that section.
 * @param {bool} hideableStagesAllowed - True if we're able to toggle hidden stages
 */
export function setHiddenStages(hiddenStagesPerSection, hideableStagesAllowed) {
  return {
    type: SET_HIDDEN_STAGES,
    hiddenStagesPerSection,
    hideableStagesAllowed
  };
}
export function updateHiddenStage(sectionId, stageId, hidden) {
  return {
    type: UPDATE_HIDDEN_STAGE,
    sectionId,
    stageId,
    hidden
  };
}

export function updateHiddenScript(sectionId, scriptId, hidden) {
  return {
    type: UPDATE_HIDDEN_SCRIPT,
    sectionId,
    scriptId,
    hidden
  };
}

/**
 * Toggle the hidden state of a particular stage in a section, updating our local
 * state to reflect the change, and posting to the server.
 */
export function toggleHiddenStage(scriptName, sectionId, stageId, hidden) {
  return dispatch => {
    // update local state
    dispatch(updateHiddenStage(sectionId, stageId, hidden));
    postToggleHidden(scriptName, sectionId, stageId, hidden);
  };
}

/**
 * Toggle the hidden state of a particular script in a section.
 */
export function toggleHiddenScript(scriptName, sectionId, scriptId, hidden) {
  return dispatch => {
    dispatch(updateHiddenScript(sectionId, scriptId, hidden));
    postToggleHidden(scriptName, sectionId, null, hidden);
  };
}

/**
 * Post to the server to toggle the hidden state of a stage or script. stageId
 * should be null if we're hiding the script rather than a particular stage
 * @param {string} scriptName
 * @param {string} sectionId
 * @param {string} stageId
 * @param {boolean} hidden
 */
function postToggleHidden(scriptName, sectionId, stageId, hidden) {
  const data = {
    section_id: sectionId,
    hidden
  };
  if (stageId) {
    data.stage_id = stageId;
  }

  $.ajax({
    type: 'POST',
    url: `/s/${scriptName}/toggle_hidden`,
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(data)
  }).success(() => {
    window.__TestInterface = window.__TestInterface || {};
    window.__TestInterface.toggleHiddenUnitComplete = true;
  });
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
    })
      .done(response =>
        dispatch(initializeHiddenStages(response, canHideStages))
      )
      .fail(err => console.error(err));
  };
}

/**
 * Initialize hidden stages based on server data. In the case of a student, this
 * will be a list of hidden stage ids. In the case of a teacher, it will be
 * a mapping from section id to a list of hidden stage ids for that section
 * @param {string[]|Object<string, string[]>} data
 * @param {boolean} canHideStages - True if we're able to toggle hidden stages
 */
function initializeHiddenStages(data, canHideStages) {
  return dispatch => {
    // For a teacher, we get back a map of section id to hidden stage ids
    // For a student, we just get back a list of hidden stage ids. Turn that
    // into an object, under the 'sectionId' of STUDENT_SECTION_ID
    if (Array.isArray(data)) {
      data = {[STUDENT_SECTION_ID]: data};
    }

    dispatch(setHiddenStages(data, !!canHideStages));
  };
}

/**
 * Given server data for the set of scripts that are hidden for this user,
 * populate our redux store.
 * @param {string[]|Object<string, string[]>} data
 */
export function initializeHiddenScripts(data) {
  return dispatch => {
    if (!data) {
      return;
    }

    // For a teacher, we get back a map of section id to hidden script ids
    // For a student, we just get back a list of hidden script ids. Turn that
    // into an object, under the 'sectionId' of STUDENT_SECTION_ID
    if (Array.isArray(data)) {
      data = {[STUDENT_SECTION_ID]: data};
    }

    Object.keys(data).forEach(sectionId => {
      const hiddenScriptIds = data[sectionId];
      hiddenScriptIds.forEach(scriptId => {
        dispatch(updateHiddenScript(sectionId, scriptId, true));
      });
    });
  };
}

// utils

/**
 * Helper to determine whether a stage is hidden for a given section. If no
 * section is given, we assume this is a student and use STUDENT_SECTION_ID
 */
export function isStageHiddenForSection(state, sectionId, stageId) {
  return isHiddenForSection(state, sectionId, stageId, 'stagesBySection');
}

/**
 * Helper to determine whether a script is hidden for a given section. If no
 * section is given, we assume this is a student and use STUDENT_SECTION_ID
 */
export function isScriptHiddenForSection(state, sectionId, scriptId) {
  return isHiddenForSection(state, sectionId, scriptId, 'scriptsBySection');
}

/**
 * Helper used by the above two methods so that we behave the same when looking
 * for hidden stages/scripts
 */
function isHiddenForSection(state, sectionId, itemId, bySectionKey) {
  if (!itemId) {
    return false;
  }
  // if we don't have a sectionId, we must be a student
  if (!sectionId) {
    sectionId = STUDENT_SECTION_ID;
  }
  const bySection = state.get(bySectionKey);
  return !!bySection.getIn([sectionId.toString(), itemId.toString()]);
}
