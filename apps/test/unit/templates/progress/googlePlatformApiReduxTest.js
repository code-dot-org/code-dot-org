import {expect} from '../../../util/reconfiguredChai';
import {
  registerReducers,
  getStore,
  stubRedux,
  restoreRedux
} from '@cdo/apps/redux';
import reducer, {
  GOOGLE_PLATFORM_API_ID,
  loadGooglePlatformApi,
  canShowGoogleShareButton
} from '@cdo/apps/templates/progress/googlePlatformApiRedux';

describe('Google Platoform API redux module', () => {
  const initialState = {
    loading: false,
    loaded: false,
    loadStartTime: null
  };
  let store;

  const state = () => store.getState().googlePlatformApi;

  beforeEach(() => {
    stubRedux();
    registerReducers({googlePlatformApi: reducer});
    store = getStore();
  });

  afterEach(() => {
    restoreRedux();
    const gapi = document.getElementById(GOOGLE_PLATFORM_API_ID);
    if (gapi) {
      gapi.parentNode.removeChild(gapi);
    }
  });

  it('has expected initial state', () => {
    expect(reducer(undefined, {})).to.deep.equal(initialState);
  });

  it('returns previous state when an unrecognized action is applied', () => {
    expect(reducer(undefined, {type: 'fakeAction'})).to.deep.equal(
      initialState
    );
  });

  it('loads the google platform api', () => {
    const promise = store.dispatch(loadGooglePlatformApi());
    expect(state().loading).to.be.true;
    return promise.then(() => {
      expect(state().loaded).to.be.true;
      expect(state().loading).to.be.false;
    });
  });

  it('handles concurrent load requests', () => {
    const promise1 = store.dispatch(loadGooglePlatformApi());
    const promise2 = store.dispatch(loadGooglePlatformApi());
    return Promise.all[(promise1, promise2)];
  });

  it('canShowGoogleShareButton only once API is loaded', () => {
    expect(canShowGoogleShareButton(store.getState())).to.be.false;
    return store.dispatch(loadGooglePlatformApi()).then(() => {
      expect(canShowGoogleShareButton(store.getState())).to.be.true;
    });
  });
});
