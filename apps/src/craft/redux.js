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

export const setPlayerSelectionDialog = (
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
const craft = (state = initialState, action) => {
  if (action.type === SET_PLAYER_SELECTION_DIALOG) {
    return {
      ...state,
      playerSelectionDialogOpen: action.isOpen,
      handlePlayerSelection: action.handlePlayerSelection
    };
  }

  return state;
};

export default {
  craft
};
