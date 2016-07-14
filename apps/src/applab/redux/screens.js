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
    FAILED_FETCHING: 'screens/importProject/FAILED_FETCHING',
    FINISHED_FETCHING: 'screens/importProject/FINISHED_FETCHING',
  },
};

var ImportProjectState = Immutable.Record({
  isFetchingProject: false,
  errorFetchingProject: false,
  fetchedProject: null,
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
    case IMPORT.IMPORT_PROJECT.START_FETCHING:
      return state.setIn(['importProject', 'isFetchingProject'], true);
    case IMPORT.IMPORT_PROJECT.FINISHED_FETCHING:
      return state.update(
        'importProject',
        importProject => importProject.merge({
          isFetchingProject: false,
          errorFetchingProject: null,
        }).set('fetchedProject', action.project)
      );
    case IMPORT.IMPORT_PROJECT.FAILED_FETCHING:
      return state.mergeDeep({
        importProject: {
          isFetchingProject: false,
          errorFetchingProject: true,
        }
      });
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
      dispatch({type: IMPORT.IMPORT_PROJECT.FAILED_FETCHING, url});
    };
    var onSuccess = () => {
      if (sources && channel) {
        dispatch({type: IMPORT.IMPORT_PROJECT.FINISHED_FETCHING, url, project: {channel, sources}});
      }
    };
    if (match) {
      var projectId = match[1];
      dispatch({type: IMPORT.IMPORT_PROJECT.START_FETCHING, url});

      channelsApi.withProjectId(projectId).ajax(
        'GET',
        '',
        xhr => {
          channel = JSON.parse(xhr.response);
          onSuccess();
        },
        onError
      );
      sourcesApi.withProjectId(projectId).ajax(
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
