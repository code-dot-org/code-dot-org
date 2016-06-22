import Immutable from 'immutable';
import {
  sources as sourcesApi,
  channels as channelsApi,
} from '../../clientApi';

const CHANGE_SCREEN = 'screens/CHANGE_SCREEN';
const TOGGLE_IMPORT_SCREEN = 'screens/TOGGLE_IMPORT_SCREEN';
const IMPORT = {
  IMPORT_PROJECT: {
    START_FETCHING: 'screens/importProject/START_FETCHING',
  },
};

var ImportProjectState = Immutable.Record({
  isFetchingProject: false,
  errorFetchingProject: false,
});

const ScreenState = Immutable.Record({
  currentScreenId: null,
  isImportingScreen: false,
  importProject: new ImportProjectState(),
});

const initialState = new ScreenState();

export default function (state = initialState, action) {
  switch (action.type) {
    case CHANGE_SCREEN:
      return state.set('currentScreenId', action.screenId);
    case TOGGLE_IMPORT_SCREEN:
      return state.set('isImportingScreen', action.importing);
    case 'LOAD_PROJECT_FAILURE':
      return state.mergeDeep({
        importProject: {
          isFetchingProject: false,
          errorFetchingProject: true,
        }
      });
    case IMPORT.IMPORT_PROJECT.START_FETCHING:
      return state.setIn(['importProject', 'isFetchingProject'], true);
    default:
      return state;
  }
}

/**
 * Change the active app screen while designing the app.
 * Note: Runtime screen changes are a separate operation, currently handled
 * in applab.js
 * @param {!string} screenId
 * @returns {{type: ActionType, screenId: string}}
 */
export const changeScreen = screenId => ({
  type: CHANGE_SCREEN,
  screenId
});

/**
 * Change the state of whether we are importing a screen or not.
 * @param {!bool} importing
 * @returns {{type: ActionType, importing: bool}}
 */
export const toggleImportScreen = (importing) => ({
  type: TOGGLE_IMPORT_SCREEN,
  importing,
});

export function fetchProject(url) {
  return dispatch => {
    var sources;
    var channel;
    var match = url.match(/projects\/applab\/([^\/]+)/);
    var onError = () => {
      dispatch({type: 'LOAD_PROJECT_FAILURE', url});
      //this.setState({error: errorText, fetching: false});
    };
    var onSuccess = () => {
      if (sources && channel) {
        dispatch({type: 'LOAD_PROJECT_SUCCESS', url, project: {channel, sources}});
      }
    };
    if (match) {
      var projectId = match[1];
      dispatch({type: 'LOAD_PROJECT', url});

      // TODO: this is not safe at all because sourcesApi is a global
      // and other callers might rely on project id not being set.
      channelsApi.setProjectId(projectId).ajax(
        'GET',
        '',
        xhr => {
          channel = JSON.parse(xhr.response);
          onSuccess();
        },
        onError
      );
      sourcesApi.setProjectId(projectId).ajax(
        'GET',
        'main.json',
        xhr => {
          sources = JSON.parse(xhr.response);
          onSuccess();
        },
        onError
      );
    } else {
      onError();
    }
  };
}
