/* eslint no-unused-vars: "error" */

import Immutable from 'immutable';
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
    var assets;
    var existingAssets;
    var match = url.match(/projects\/applab\/([^\/]+)/);
    var onError = () => {
      dispatch({type: IMPORT.PROJECT.FAILED_FETCHING, url});
    };
    var onSuccess = () => {
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
    if (match) {
      var projectId = match[1];
      dispatch({type: IMPORT.PROJECT.START_FETCHING, url});

      assetsApi.ajax(
        'GET',
        '',
        xhr => {
          existingAssets = JSON.parse(xhr.response);
          onSuccess();
        },
        onError
      );
      assetsApi.withProjectId(projectId).ajax(
        'GET',
        '',
        xhr => {
          assets = JSON.parse(xhr.response);
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
    } else {
      onError();
    }
  };
}


export function importIntoProject(projectId, screens, assets) {
  return dispatch => {
    dispatch({type: IMPORT.SCREENS.START_IMPORTING, screens, assets});
    importFuncs.importScreensAndAssets(projectId, screens, assets).then(
      () => {
        dispatch({type: IMPORT.SCREENS.FINISHED_IMPORTING});
        const lastScreen = screens[screens.length - 1];
        dispatch(changeScreen(lastScreen.id));
      },
      () => dispatch({type: IMPORT.SCREENS.FAILED_IMPORTING})
    );
  };
}
