import {getStore} from '@cdo/apps/redux';

/**
 * Initial State
 */
const initialState = {
  playerSelectionDialogOpen: false,
  handlePlayerSelection: () => {}
};

/**
 * Actions
 */

const SET_PLAYER_SELECTION_DIALOG = 'craft/SET_PLAYER_SELECTION_DIALOG';

/**
 * Action Creators
 */

const setPlayerSelectionDialog = (
  isOpen,
  handlePlayerSelection = () => {}
) => ({
  type: SET_PLAYER_SELECTION_DIALOG,
  isOpen,
  handlePlayerSelection
});

/**
 * Reducers
 */
function craft(state = initialState, action) {
  if (action.type === SET_PLAYER_SELECTION_DIALOG) {
    return {
      ...state,
      playerSelectionDialogOpen: action.isOpen,
      handlePlayerSelection: action.handlePlayerSelection
    };
  }

  return state;
}

export default {
  craft
};

/**
 * Helpers
 */

export function openPlayerSelectionDialog(onSelectedCallback) {
  getStore().dispatch(setPlayerSelectionDialog(true, onSelectedCallback));
}

export function closePlayerSelectionDialog() {
  getStore().dispatch(setPlayerSelectionDialog(false));
}
