/**
 * Reducer and actions for stage lock info. This includes the teacher panel on
 * the course overview page, and the stage locking dialog.
 */

import { INIT_PROGRESS } from './progressRedux';
import experiments from '@cdo/apps/experiments';

export const TOGGLE_HIDDEN = 'hiddenStage/TOGGLE_HIDDEN';

export const hiddenStagesEnabled = () => experiments.isEnabled('hiddenStages');

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
        [stage.id]: hiddenStagesEnabled() ? !!stage.hidden : false
      }), {})
    };
  }

  if (action.type === TOGGLE_HIDDEN) {
    const { stageId, hidden } = action;
    if (state[stageId] !== hidden) {
      return {
        ...state,
        // never hide unless isEnabled
        [stageId]: hiddenStagesEnabled() ? hidden : false
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
