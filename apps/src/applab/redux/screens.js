const CHANGE_SCREEN = 'screens/CHANGE_SCREEN';

const initialState = {
  currentScreenId: null,
  allScreens: []
};

export default function (state = initialState, action) {
  if (action.type === CHANGE_SCREEN) {
    return Object.assign({}, state, {
      currentScreenId: action.screenId
    });
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
