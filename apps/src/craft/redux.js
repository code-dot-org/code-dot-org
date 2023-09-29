import redux from '@cdo/apps/redux';

/**
 * Initial State
 */
const initialState = {
  playerSelectionDialogOpen: false,
  handlePlayerSelection: () => {},
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
  handlePlayerSelection,
});

/**
 * Reducers
 */
function craft(state = initialState, action) {
  if (action.type === SET_PLAYER_SELECTION_DIALOG) {
    return {
      ...state,
      playerSelectionDialogOpen: action.isOpen,
      handlePlayerSelection: action.handlePlayerSelection,
    };
  }

  return state;
}

/**
 * Helpers
 */

export function openPlayerSelectionDialog(onSelectedCallback) {
  redux.getStore().dispatch(setPlayerSelectionDialog(true, onSelectedCallback));
}

export function closePlayerSelectionDialog() {
  redux.getStore().dispatch(setPlayerSelectionDialog(false));
}

export default {
  closePlayerSelectionDialog,
  craft,
  openPlayerSelectionDialog,
};
