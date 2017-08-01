import {expect} from '../../util/configuredChai';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux
} from '@cdo/apps/redux';
import urlHelpers, {
  setPegasusHost,
  pegasusUrl
} from '@cdo/apps/redux/urlHelpers';

describe('urlHelpers', () => {
  describe('initial state', () => {
    it('pegasusHost is https://code.org', () => {
      const initialState = urlHelpers();
      expect(initialState.pegasusHost).to.equal('https://code.org');
    });
  });

  describe('setPegasusHost', () => {
    it('sets pegasusHost', () => {
      const initialState = urlHelpers();
      const newState = urlHelpers(initialState, setPegasusHost('garbage'));
      expect(newState.pegasusHost).to.equal('garbage');
    });
  });

  describe('pegasusUrl', () => {
    it('appends relative url to the configured pegasus host', () => {
      stubRedux();
      registerReducers({urlHelpers});
      const store = getStore();

      expect(pegasusUrl(store.getState(), '/certificates')).to.equal('https://code.org/certificates');
      store.dispatch(setPegasusHost('garbage://pile'));
      expect(pegasusUrl(store.getState(), '/certificates')).to.equal('garbage://pile/certificates');

      restoreRedux();
    });

    it('returns relative url if urlHelpers reducer is not registered', () => {
      stubRedux();
      const store = getStore();

      expect(pegasusUrl(store.getState(), '/certificates')).to.equal('/certificates');

      restoreRedux();
    });
  });
});
