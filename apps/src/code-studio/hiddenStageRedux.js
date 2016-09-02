/**
 * Reducer and actions for stage lock info. This includes the teacher panel on
 * the course overview page, and the stage locking dialog.
 */

import { INIT_PROGRESS } from './progressRedux';

export const TOGGLE_HIDDEN = 'hiddenStage/TOGGLE_HIDDEN';

/**
 * hidden stage reducer
 * Mapping of stage ids to bools indicating whether it's locked or not
 */
export default function reducer(state = {}, action) {
  if (action.type === INIT_PROGRESS) {
    return {
      ...state,
      ...action.stages.reduce((obj, stage) => ({
        ...obj,
        [stage.id]: stage.hidden
      }), {})
    };
  }

  if (action.type === TOGGLE_HIDDEN) {
    const { stageId, hidden } = action;
    if (state[stageId] !== hidden) {
      return {
        ...state,
        [stageId]: hidden
      };
    }
  }

  return state;
}

// action creators
export function toggleHidden(stageId, hidden) {
  return {
    type: TOGGLE_HIDDEN,
    stageId,
    hidden
  };
}
