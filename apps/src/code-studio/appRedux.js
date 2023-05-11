const SET_APP_LOAD_STARTED = 'app/SET_APP_LOAD_STARTED';
const SET_APP_LOADED = 'app/SET_APP_LOADED';

const initialState = {
  appLoadStarted: false,
  appLoaded: false,
};

export default (state = initialState, action) => {
  if (action.type === SET_APP_LOAD_STARTED) {
    return {
      ...state,
      appLoadStarted: true,
    };
  }
  if (action.type === SET_APP_LOADED) {
    return {
      ...state,
      appLoaded: true,
    };
  }
  return state;
};

export const setAppLoadStarted = () => ({
  type: SET_APP_LOAD_STARTED,
});

export const setAppLoaded = () => ({
  type: SET_APP_LOADED,
});
