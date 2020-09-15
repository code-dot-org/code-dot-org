import {getStore} from '@cdo/apps/redux';

/*
 * The Google Classroom Share Button is only available through the google
 * platform api, so we have to add it to our page on load. We manage loading
 * in redux since multiple components need to observe the loading state.
 */

const START_LOADING_GAPI = 'googlePlatformApi/START_LOADING_GAPI';
const FINISH_LOADING_GAPI = 'googlePlatformApi/FINISH_LOADING_GAPI';

export const startLoadingGapi = () => ({type: START_LOADING_GAPI});
const finishLoadingGapi = success => ({type: FINISH_LOADING_GAPI, success});

const GOOGLE_PLATFORM_API_ID = 'GooglePlatformApiId';
const LOAD_TIMEOUT_MILLIS = 15000;

const initialState = {
  loading: false,
  loaded: false,
  loadStartTime: null
};

export function canShowGoogleShareButton(state) {
  return !!state.googlePlatformApi && state.googlePlatformApi.loaded;
}

export default function googlePlatformApi(state = initialState, action) {
  if (action.type === START_LOADING_GAPI) {
    if (gapiReady()) {
      return {
        ...state,
        loaded: true
      };
    } else {
      loadApi();
      return {
        ...state,
        loading: true,
        loadStartTime: Date.now()
      };
    }
  }
  if (action.type === FINISH_LOADING_GAPI) {
    return {
      ...state,
      loading: false,
      loaded: action.success
    };
  }
  return state;
}

function loadApi() {
  if (!document.getElementById(GOOGLE_PLATFORM_API_ID)) {
    window.___gcfg = {
      parsetags: 'explicit'
    };

    const gapi = document.createElement('script');
    gapi.src = 'https://apis.google.com/js/platform.js';
    gapi.id = GOOGLE_PLATFORM_API_ID;
    gapi.onload = waitForGapi;
    gapi.onerror = () => getStore().dispatch(finishLoadingGapi(false));
    document.body.appendChild(gapi);
  } else {
    waitForGapi();
  }
}

function waitForGapi() {
  if (gapiReady()) {
    getStore().dispatch(finishLoadingGapi(true));
  } else if (elapsedLoadTime() >= LOAD_TIMEOUT_MILLIS) {
    getStore().dispatch(finishLoadingGapi(false));
  } else if (isLoading) {
    setTimeout(() => {
      waitForGapi();
    }, 100);
  }
}

function gapiReady() {
  return !!window.gapi && typeof window.gapi.sharetoclassroom !== 'undefined';
}

function elapsedLoadTime() {
  const startTime = getStore().getState().googlePlatformApi.loadStartTime;
  if (startTime) {
    return Date.now() - startTime;
  } else {
    return -1;
  }
}

function isLoading() {
  return getStore().getState().googlePlatformApi.loading;
}
