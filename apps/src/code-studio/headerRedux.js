import { combineReducers } from 'redux';
import clientApi from './initApp/clientApi';
const channels = clientApi.create('/v3/channels');

// Action types

const SHOW_SHARE_DIALOG = 'shareDialog/SHOW_SHARE_DIALOG';
const HIDE_SHARE_DIALOG = 'shareDialog/HIDE_SHARE_DIALOG';

const UNPUBLISH_REQUEST  = 'shareDialog/UNPUBLISH_REQUEST';
const UNPUBLISH_SUCCESS  = 'shareDialog/UNPUBLISH_SUCCESS';
const UNPUBLISH_FAILURE  = 'shareDialog/UNPUBLISH_FAILURE';

// Reducer

const initialShareDialogState = {
  isOpen: false,
  isUnpublishPending: false,
};

function shareDialog(state = initialShareDialogState, action) {
  switch (action.type) {
    case SHOW_SHARE_DIALOG:
      return {
        ...state,
        isOpen: true,
      };
    case HIDE_SHARE_DIALOG:
      return initialShareDialogState;
    case UNPUBLISH_REQUEST:
      return {
        ...state,
        isUnpublishPending: true,
      };
    case UNPUBLISH_SUCCESS:
      return initialShareDialogState;
    case UNPUBLISH_FAILURE:
      return {
        ...state,
        isUnpublishPending: false,
      };
    default:
      return state;
  }
}

const reducer = combineReducers({
  shareDialog,
});
export default reducer;

// Action creators

export function showShareDialog() {
  return {type: SHOW_SHARE_DIALOG};
}

export function hideShareDialog() {
  return {type: HIDE_SHARE_DIALOG};
}

export function unpublishProject(projectId) {
  return dispatch => {
    dispatch({type: UNPUBLISH_REQUEST});
    return new Promise((resolve, reject) => {
      channels.update(`${projectId}/unpublish`, null, err => {
        if (err) {
          dispatch({type: UNPUBLISH_FAILURE});
          reject(err);
        } else {
          dispatch({type: UNPUBLISH_SUCCESS});
          resolve();
        }
      });
    });
  };
}

