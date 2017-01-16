/** @file Redux reducer functions for WebLab.
 *  @see http://redux.js.org/docs/basics/Reducers.html */
import { ActionType } from './actions';

function inspectorOn(state, action) {
  state = state || false;

  switch (action.type) {
    case ActionType.CHANGE_INSPECTOR_ON:
      return action.inspectorOn;
    default:
      return state;
  }
}

export default {
  inspectorOn
};
