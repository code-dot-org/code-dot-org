/** @file Tests for App Lab redux module */
import {expect, assert} from '../../../util/deprecatedChai';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux
} from '@cdo/apps/redux';
import {ApplabInterfaceMode} from '@cdo/apps/applab/constants';
import {reducers, actions} from '@cdo/apps/applab/redux/applab';
import {REDIRECT_RESPONSE} from '../../../../src/applab/redux/applab';

describe('App Lab redux module', () => {
  let store;

  beforeEach(() => {
    stubRedux();
    registerReducers(reducers);
    store = getStore();
  });

  afterEach(() => {
    restoreRedux();
  });

  describe('redirectNotice', () => {
    describe('the initial state', () => {
      it('has no redirect notices', () => {
        expect(store.getState().redirectDisplay).to.be.empty;
      });
    });

    describe('the addRedirectNotice action', () => {
      it('adds a single redirect notice', () => {
        store.dispatch(
          actions.addRedirectNotice(REDIRECT_RESPONSE.REJECTED, 'this-is.a.url')
        );

        expect(store.getState().redirectDisplay.length).to.equal(1);
        const redirect = store.getState().redirectDisplay[0];
        expect(redirect.url).to.equal('this-is.a.url');
        expect(redirect.response).to.equal(REDIRECT_RESPONSE.REJECTED);
      });

      it('adds a multiple redirect notices back to back', () => {
        store.dispatch(
          actions.addRedirectNotice(REDIRECT_RESPONSE.REJECTED, 'this-is.a.url')
        );
        store.dispatch(
          actions.addRedirectNotice(REDIRECT_RESPONSE.APPROVED, 'also-a.url')
        );

        expect(store.getState().redirectDisplay.length).to.equal(2);
        const redirect = store.getState().redirectDisplay[0];
        expect(redirect.url).to.equal('also-a.url');
        expect(redirect.response).to.equal(REDIRECT_RESPONSE.APPROVED);
      });
    });

    describe('the dismissRedirectNotice action', () => {
      it('removes the first redirect notice of many', () => {
        store.dispatch(
          actions.addRedirectNotice(REDIRECT_RESPONSE.REJECTED, 'this-is.a.url')
        );
        store.dispatch(
          actions.addRedirectNotice(REDIRECT_RESPONSE.APPROVED, 'also-a.url')
        );
        expect(store.getState().redirectDisplay.length).to.equal(2);
        store.dispatch(actions.dismissRedirectNotice());

        expect(store.getState().redirectDisplay.length).to.equal(1);
        const redirect = store.getState().redirectDisplay[0];
        expect(redirect.url).to.equal('this-is.a.url');
        expect(redirect.response).to.equal(REDIRECT_RESPONSE.REJECTED);
      });

      it('removes the only redirect notice', () => {
        store.dispatch(
          actions.addRedirectNotice(REDIRECT_RESPONSE.REJECTED, 'this-is.a.url')
        );
        expect(store.getState().redirectDisplay.length).to.equal(1);

        store.dispatch(actions.dismissRedirectNotice());
        expect(store.getState().redirectDisplay).to.be.empty;
      });

      it('does not affect state when no redirects exist', () => {
        expect(store.getState().redirectDisplay).to.be.empty;
        store.dispatch(actions.dismissRedirectNotice());
        expect(store.getState().redirectDisplay).to.be.empty;
      });
    });
  });

  describe('interfaceMode', () => {
    it('exposes state on the interfaceMode key', () => {
      expect(store.getState().interfaceMode).to.not.be.undefined;
    });

    describe('the initial state', () => {
      it('is always CODE mode', () => {
        expect(store.getState().interfaceMode).to.equal(
          ApplabInterfaceMode.CODE
        );
      });
    });

    describe('the changeInterfaceMode action', () => {
      it('can change to DESIGN mode', () => {
        store.dispatch(actions.changeInterfaceMode(ApplabInterfaceMode.DESIGN));
        expect(store.getState().interfaceMode).to.equal(
          ApplabInterfaceMode.DESIGN
        );
      });
      it('and to DATA mode', () => {
        store.dispatch(actions.changeInterfaceMode(ApplabInterfaceMode.DATA));
        expect(store.getState().interfaceMode).to.equal(
          ApplabInterfaceMode.DATA
        );
      });
      it('and back to CODE mode', () => {
        store.dispatch(actions.changeInterfaceMode(ApplabInterfaceMode.DATA));
        expect(store.getState().interfaceMode).not.to.equal(
          ApplabInterfaceMode.CODE
        );
        store.dispatch(actions.changeInterfaceMode(ApplabInterfaceMode.CODE));
        expect(store.getState().interfaceMode).to.equal(
          ApplabInterfaceMode.CODE
        );
      });
    });
  });

  describe('level', () => {
    describe('setLevelData', () => {
      it('sets given data on the level', () => {
        let data = {name: 'Favorite Level!', isStartMode: true};
        store.dispatch(actions.setLevelData(data));
        assert.deepEqual(data, store.getState().level);
        // Only update level name, make sure other data is unaffected.
        data.name = 'New Name!';
        store.dispatch(actions.setLevelData({name: data.name}));
        assert.deepEqual(data, store.getState().level);
      });
    });
  });

  describe('maker', () => {
    it('exposes state on the maker key', () => {
      expect(store.getState().maker).to.not.be.undefined;
    });
  });
});
