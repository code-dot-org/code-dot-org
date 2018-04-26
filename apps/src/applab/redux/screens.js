import Immutable from 'immutable';
import $ from 'jquery';
import {
  sources as sourcesApi,
  channels as channelsApi,
  assets as assetsApi,
} from '../../clientApi';
import * as importFuncs from '../import';

const CHANGE_SCREEN = 'screens/CHANGE_SCREEN';
const TOGGLE_IMPORT_SCREEN = 'screens/TOGGLE_IMPORT_SCREEN';
const IMPORT = {
  PROJECT: {
    START_FETCHING: 'screens/importProject/START_FETCHING',
    FAILED_FETCHING: 'screens/importProject/FAILED_FETCHING',
    FINISHED_FETCHING: 'screens/importProject/FINISHED_FETCHING',
  },
  SCREENS: {
    START_IMPORTING: 'screens/importScreens/START_IMPORTING',
    FAILED_IMPORTING: 'screens/importScreens/FAILED_IMPORTING',
    FINISHED_IMPORTING: 'screens/importScreens/FINISHED_IMPORTING',
  },
};

var ImportProjectState = Immutable.Record({
  isFetchingProject: false,
  errorFetchingProject: false,
  fetchedProject: null,
  importableProject: null,
  isImportingProject: false,
  errorImportingProject: false,
});

const ScreenState = Immutable.Record({
  currentScreenId: null,
  isImportingScreen: false,
  importProject: undefined,
});

const initialState = new ScreenState();

function screensReducer(state = initialState, action) {
  switch (action.type) {
    case CHANGE_SCREEN:
      return state.set('currentScreenId', action.screenId);
    case TOGGLE_IMPORT_SCREEN:
      return state.set('isImportingScreen', action.importing);
    case IMPORT.SCREENS.FINISHED_IMPORTING:
      return state.set('isImportingScreen', false);
    default:
      return state;
  }
}

function importReducer(state = new ImportProjectState(), action) {
  switch (action.type) {
    case TOGGLE_IMPORT_SCREEN:
      return new ImportProjectState();
    case IMPORT.PROJECT.START_FETCHING:
      return state.set('isFetchingProject', true);
    case IMPORT.PROJECT.FINISHED_FETCHING:
      return state
        .merge({
          isFetchingProject: false,
          errorFetchingProject: null,
        })
        // use set instead of merge to keep it as a plain js object.
        .set('fetchedProject', action.project)
        .set('importableProject', importFuncs.getImportableProject(action.project));
    case IMPORT.PROJECT.FAILED_FETCHING:
      return state.merge({
        isFetchingProject: false,
        errorFetchingProject: true,
      });
    case IMPORT.SCREENS.START_IMPORTING:
      return state.set('isImportingProject', true);
    case IMPORT.SCREENS.FINISHED_IMPORTING:
      return new ImportProjectState();
    case IMPORT.SCREENS.FAILED_IMPORTING:
      return state.merge({
        isImportingProject: false,
        errorImportingProject: true,
      });
    default:
      return state;
  }
}

export default function (state = initialState, action) {
  state = screensReducer(state, action);
  return state.set('importProject', importReducer(state.importProject, action));
}

/**
 * Change the active app screen while designing the app.
 * Note: Runtime screen changes are a separate operation, currently handled
 * in applab.js
 * @param {!string} screenId
 * @returns {{type: string, screenId: string}}
 */
export const changeScreen = screenId => ({
  type: CHANGE_SCREEN,
  screenId
});

/**
 * Change the state of whether we are importing a screen or not.
 * @param {!bool} importing
 * @returns {{type: string, importing: bool}}
 */
export const toggleImportScreen = (importing) => ({
  type: TOGGLE_IMPORT_SCREEN,
  importing,
});

function getProjectIdFromUrl(url) {
  const match = url.match(/projects\/applab\/([^\/]+)/);
  if (match) {
    return match[1];
  }
}

export function fetchProject(url) {
  return dispatch => {
    let sources;
    let channel;
    let assets;
    let existingAssets;

    const onError = () => dispatch({type: IMPORT.PROJECT.FAILED_FETCHING, url});
    const onSuccess = () => {
      if (sources && channel && assets && existingAssets) {
        dispatch({
          type: IMPORT.PROJECT.FINISHED_FETCHING,
          url,
          project: {
            channel,
            sources,
            assets,
            existingAssets,
          }
        });
      }
    };

    const attemptFetchProject = projectId => {
      assetsApi.getFiles(
        result => {
          existingAssets = result.files;
          onSuccess();
        },
        onError
      );
      assetsApi.withProjectId(projectId).getFiles(
        result => {
          assets = result.files;
          onSuccess();
        },
        onError
      );
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
    };

    dispatch({type: IMPORT.PROJECT.START_FETCHING, url});

    const projectId = getProjectIdFromUrl(url);
    if (projectId) {
      attemptFetchProject(projectId);
    } else {
      $.get('/redirected_url?u=' + encodeURIComponent(url), response => {
        const projectId = getProjectIdFromUrl(response);
        if (projectId) {
          attemptFetchProject(projectId);
        } else {
          onError();
        }
      }).fail(onError);
    }
  };
}


export function importIntoProject(projectId, screens, assets) {
  return dispatch => {
    dispatch({type: IMPORT.SCREENS.START_IMPORTING, screens, assets});
    importFuncs.importScreensAndAssets(projectId, screens, assets).then(
      () => {
        dispatch({type: IMPORT.SCREENS.FINISHED_IMPORTING});
        if (screens.length > 0) {
          const lastScreen = screens[screens.length - 1];
          dispatch(changeScreen(lastScreen.id));
        }
      },
      () => dispatch({type: IMPORT.SCREENS.FAILED_IMPORTING})
    );
  };
}
