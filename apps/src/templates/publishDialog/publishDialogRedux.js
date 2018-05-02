import { channels as channelsApi } from '../../clientApi';
import { AllPublishableProjectTypes } from '../../util/sharedConstants';

// Action types

const SHOW_PUBLISH_DIALOG = 'publishDialog/SHOW_PUBLISH_DIALOG';
const HIDE_PUBLISH_DIALOG = 'publishDialog/HIDE_PUBLISH_DIALOG';

export const PUBLISH_REQUEST = 'shareDialog/PUBLISH_REQUEST';
export const PUBLISH_SUCCESS = 'shareDialog/PUBLISH_SUCCESS';
export const PUBLISH_FAILURE = 'shareDialog/PUBLISH_FAILURE';

// Reducer

const initialState = {
  isOpen: false,
  projectId: null,
  projectType: null,
  isPublishPending: false,
  lastPublishedAt: null,
  lastPublishedProjectData: null,
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
      return {
        ...state,
        isOpen: false,
      };
    case PUBLISH_REQUEST:
      return {
        ...state,
        isPublishPending: true,
      };
    case PUBLISH_SUCCESS:
      // Keep projectId and projectType fields, as these may be used by
      // subscribers listening for this action type.
      return {
        ...state,
        isOpen: false,
        isPublishPending: false,
        lastPublishedAt: action.lastPublishedAt,
        lastPublishedProjectData: action.lastPublishedProjectData,
      };
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
  // Don't enforce restrictions here on which project types young students can
  // publish. Instead, restrict when to show the publish button in the UI, and
  // enforce age restrictions on the "publish" REST endpoint.
  return dispatch => {
    if (!AllPublishableProjectTypes.includes(projectType)) {
      return Promise.reject(`Cannot publish project of type ${projectType}.`);
    }
    dispatch({type: PUBLISH_REQUEST});
    return new Promise((resolve, reject) => {
      channelsApi.withProjectId(projectId).ajax(
        'POST',
        `publish/${projectType}`,
        xhr => {
          const data = JSON.parse(xhr.response);
          dispatch({
            type: PUBLISH_SUCCESS,
            lastPublishedAt: data.publishedAt,
            lastPublishedProjectData: data,
          });
          resolve();
        },
        err => {
          dispatch({type: PUBLISH_FAILURE});
          reject(err);
        },
        null,
      );
    });
  };
}
