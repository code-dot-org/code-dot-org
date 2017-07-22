import { combineReducers } from 'redux';
import publishDialog from '../templates/publishDialog/publishDialogRedux';

// Action types

const SHOW_SHARE_DIALOG = 'shareDialog/SHOW_SHARE_DIALOG';
const HIDE_SHARE_DIALOG = 'shareDialog/HIDE_SHARE_DIALOG';

// Reducer

const initialShareDialogState = {
  isOpen: false,
};

function shareDialog(state = initialShareDialogState, action) {
  switch (action.type) {
    case SHOW_SHARE_DIALOG:
      return {
        isOpen: true,
      };
    case HIDE_SHARE_DIALOG:
      return {
        isOpen: false,
      };
    default:
      return state;
  }
}

const reducer = combineReducers({
  shareDialog,
  publishDialog,
});
export default reducer;

// Action creators

export function showShareDialog() {
  return {type: SHOW_SHARE_DIALOG};
}

export function hideShareDialog() {
  return {type: HIDE_SHARE_DIALOG};
}
