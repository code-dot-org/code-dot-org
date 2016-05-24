import Immutable from 'immutable';

const CHANGE_SCREEN = 'screens/CHANGE_SCREEN';
const TOGGLE_IMPORT_SCREEN = 'screens/TOGGLE_IMPORT_SCREEN';

const ScreenState = Immutable.Record({
  currentScreenId: null,
  isImportingScreen: false,
});

const initialState = new ScreenState();

export default function (state = initialState, action) {
  if (action.type === CHANGE_SCREEN) {
    return state.set('currentScreenId', action.screenId);
  } else if (action.type === TOGGLE_IMPORT_SCREEN) {
    return state.set('isImportingScreen', action.importing);
  }
  return state;
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
