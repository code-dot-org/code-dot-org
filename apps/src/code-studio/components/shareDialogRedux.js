import {
  channels as channelsApi,
} from '../../clientApi';

// Action types

const SHOW_SHARE_DIALOG = 'shareDialog/SHOW_SHARE_DIALOG';
const HIDE_SHARE_DIALOG = 'shareDialog/HIDE_SHARE_DIALOG';

const UNPUBLISH_REQUEST  = 'shareDialog/UNPUBLISH_REQUEST';
const UNPUBLISH_SUCCESS  = 'shareDialog/UNPUBLISH_SUCCESS';
const UNPUBLISH_FAILURE  = 'shareDialog/UNPUBLISH_FAILURE';

// Reducer

const initialState = {
  isOpen: false,
  isUnpublishPending: false,
  didUnpublish: false,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SHOW_SHARE_DIALOG:
      return {
        ...initialState,
        isOpen: true,
      };
    case HIDE_SHARE_DIALOG:
      return initialState;
    case UNPUBLISH_REQUEST:
      return {
        ...state,
        isUnpublishPending: true,
      };
    case UNPUBLISH_SUCCESS:
      return {
        ...initialState,
        didUnpublish: true,
      };
    case UNPUBLISH_FAILURE:
      return {
        ...state,
        isUnpublishPending: false,
      };
    default:
      return state;
  }
}

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
      channelsApi.withProjectId(projectId).ajax(
        'POST',
        'unpublish',
        () => {
          dispatch({type: UNPUBLISH_SUCCESS});
          resolve();
        },
        err => {
          dispatch({type: UNPUBLISH_FAILURE});
          reject(err);
        },
        null
      );
    });
  };
}

