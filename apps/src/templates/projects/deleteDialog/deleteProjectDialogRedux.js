import { channels as channelsApi } from '../../../clientApi';

// Action types

const SHOW_DELETE_DIALOG = 'deleteDialog/SHOW_DELETE_DIALOG';
const HIDE_DELETE_DIALOG = 'deleteDialog/HIDE_DELETE_DIALOG';

export const DELETE_REQUEST = 'deleteDialog/DELETE_REQUEST';
export const DELETE_SUCCESS = 'deleteDialog/DELETE_SUCCESS';
export const DELETE_FAILURE = 'deleteDialog/DELETE_FAILURE';


// Reducer

const initialState = {
  isOpen: false,
  projectId: null,
  isDeletePending: false,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SHOW_DELETE_DIALOG:
      return {
        ...state,
        isOpen: true,
        projectId: action.projectId,
      };
    case HIDE_DELETE_DIALOG:
      return {
        ...state,
        isOpen: false,
      };
    case DELETE_REQUEST:
      return {
        ...state,
        isDeletePending: true,
      };
    case DELETE_SUCCESS:
      return {
        ...state,
        isOpen: false,
        isDeletePending: false,
      };
    case DELETE_FAILURE:
      return {
        ...state,
        isDeletePending: false,
      };
    default:
      return state;
  }
}

// Action creators

export function showDeleteDialog(projectId) {
  return {type: SHOW_DELETE_DIALOG, projectId};
}

export function hideDeleteDialog() {
  return {type: HIDE_DELETE_DIALOG};
}

/**
 * Sends a network request to delete the project, dispatching redux actions to
 * reflect the status of the network request.
 * @param {string} projectId Project id to publish.
 * @returns {Promise} Promise which resolves if the network request succeeds,
 *   or rejects with an error message otherwise.
 */
export function deleteProject(projectId) {
  return dispatch => {
    dispatch({type: DELETE_REQUEST});
    return new Promise((resolve, reject) => {
      channelsApi.withProjectId(projectId).ajax(
        'DELETE',
        '',
        xhr => {
          dispatch({
            type: DELETE_SUCCESS,
            projectId: projectId
          });
          resolve();
        },
        err => {
          dispatch({type: DELETE_FAILURE});
          reject(err);
        },
        null,
      );
    });
  };
}
