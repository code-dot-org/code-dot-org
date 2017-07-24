import clientApi from '../../code-studio/initApp/clientApi';
const channels = clientApi.create('/v3/channels');

// Only these project types can be published.
const PUBLISHED_PROJECT_TYPES = ['applab', 'gamelab', 'playlab', 'artist'];

// Action types

const SHOW_PUBLISH_DIALOG = 'publishDialog/SHOW_PUBLISH_DIALOG';
const HIDE_PUBLISH_DIALOG = 'publishDialog/HIDE_PUBLISH_DIALOG';

const PUBLISH_REQUEST = 'shareDialog/PUBLISH_REQUEST';
const PUBLISH_SUCCESS = 'shareDialog/PUBLISH_SUCCESS';
const PUBLISH_FAILURE = 'shareDialog/PUBLISH_FAILURE';

// Reducer

const initialState = {
  isOpen: false,
  projectId: null,
  projectType: null,
  isPublishPending: false,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SHOW_PUBLISH_DIALOG:
      return {
        ...state,
        isOpen: true,
        projectId: action.projectId,
        projectType: action.projectType,
      };
    case HIDE_PUBLISH_DIALOG:
      return initialState;
    case PUBLISH_REQUEST:
      return {
        ...state,
        isPublishPending: true,
      };
    case PUBLISH_SUCCESS:
      return initialState;
    case PUBLISH_FAILURE:
      return {
        ...state,
        isPublishPending: false,
      };
    default:
      return state;
  }
}

// Action creators

export function showPublishDialog(projectId, projectType) {
  return {type: SHOW_PUBLISH_DIALOG, projectId, projectType};
}

export function hidePublishDialog() {
  return {type: HIDE_PUBLISH_DIALOG};
}

/**
 * Sends a network request to publish the project, dispatching redux actions to
 * reflect the status of the network request.
 * @param {string} projectId Project id to publish.
 * @param {string} projectType Type of the project to publish.
 * @returns {Promise} Promise which resolves if the network request succeeds,
 *   or rejects with an error message otherwise.
 */
export function publishProject(projectId, projectType) {
  return dispatch => {
    dispatch({type: PUBLISH_REQUEST});
    if (!PUBLISHED_PROJECT_TYPES.includes(projectType)) {
      return Promise.reject(`Cannot publish project of type ${projectType}.`);
    }
    return new Promise((resolve, reject) => {
      channels.update(`${projectId}/publish/${projectType}`, null, (err, data) => {
        if (err) {
          dispatch({type: PUBLISH_FAILURE});
          reject(err);
        } else {
          dispatch({type: PUBLISH_SUCCESS});
          resolve(JSON.parse(data));
        }
      });
    });
  };
}
