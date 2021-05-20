import firehoseClient from '@cdo/apps/lib/util/firehose';

/*
 * The Google Classroom Share Button is only available through the google
 * platform api, so we have to add it to our page on load. We manage loading
 * in redux since multiple components need to observe the loading state.
 */

const START_LOADING_GAPI = 'googlePlatformApi/START_LOADING_GAPI';
const FINISH_LOADING_GAPI = 'googlePlatformApi/FINISH_LOADING_GAPI';

const startLoadingGapi = startTime => ({type: START_LOADING_GAPI, startTime});
const finishLoadingGapi = success => ({type: FINISH_LOADING_GAPI, success});

export const GOOGLE_PLATFORM_API_ID = 'GooglePlatformApiId';
const LOAD_TIMEOUT_MILLIS = 15000;

const initialState = {
  loading: false,
  loaded: false,
  loadStartTime: null
};

export function loadGooglePlatformApi() {
  return (dispatch, getState) => {
    if (gapiReady()) {
      dispatch(finishLoadingGapi(true));
      return Promise.resolve();
    } else {
      dispatch(startLoadingGapi(Date.now()));
      return new Promise((resolve, reject) => {
        const promise = {resolve: resolve, reject: reject};
        loadApi(dispatch, getState, promise);
      });
    }
  };
}

function onLoadFinished(success, promise) {
  return (dispatch, getState) => {
    dispatch(finishLoadingGapi(success));
    if (success) {
      promise.resolve();
    } else {
      promise.reject('Google Platform API failed to load.');
    }

    const data = {
      success: success,
      load_time: elapsedLoadTimeSeconds(getState)
    };
    firehoseClient.putRecord(
      {
        study: 'google-classroom-share-button',
        study_group: 'v0',
        event: 'api_load_finished',
        data_json: JSON.stringify(data)
      },
      {includeUserId: true}
    );
  };
}

export function canShowGoogleShareButton(state) {
  return !!state.googlePlatformApi && state.googlePlatformApi.loaded;
}

export default function googlePlatformApi(state = initialState, action) {
  if (action.type === START_LOADING_GAPI) {
    return {
      ...state,
      loading: true,
      loadStartTime: action.startTime
    };
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

function loadApi(dispatch, getState, promise) {
  if (!document.getElementById(GOOGLE_PLATFORM_API_ID)) {
    window.___gcfg = {
      parsetags: 'explicit'
    };

    const gapi = document.createElement('script');
    gapi.src = 'https://apis.google.com/js/platform.js';
    gapi.id = GOOGLE_PLATFORM_API_ID;
    gapi.onload = () => waitForGapi(dispatch, getState, promise);
    gapi.onerror = () => dispatch(onLoadFinished(false, promise));
    document.body.appendChild(gapi);
  } else {
    waitForGapi(dispatch, getState, promise);
  }
}

function waitForGapi(dispatch, getState, promise) {
  if (gapiReady()) {
    dispatch(onLoadFinished(true, promise));
  } else if (elapsedLoadTimeMillis(getState) >= LOAD_TIMEOUT_MILLIS) {
    dispatch(onLoadFinished(false, promise));
  } else if (isLoading(getState)) {
    setTimeout(() => {
      waitForGapi(dispatch, getState, promise);
    }, 100);
  }
}

function gapiReady() {
  return !!window.gapi && typeof window.gapi.sharetoclassroom !== 'undefined';
}

function elapsedLoadTimeMillis(getState) {
  const startTime = getState().googlePlatformApi.loadStartTime;
  if (startTime) {
    return Date.now() - startTime;
  } else {
    return -1;
  }
}

function elapsedLoadTimeSeconds(getState) {
  const millis = elapsedLoadTimeMillis(getState);
  if (millis >= 0) {
    return Math.round(millis / 1000);
  } else {
    return null;
  }
}

function isLoading(getState) {
  return getState().googlePlatformApi.loading;
}
