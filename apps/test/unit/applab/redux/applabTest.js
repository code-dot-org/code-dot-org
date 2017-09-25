/** @file Tests for App Lab redux module */
import {expect} from '../../../util/configuredChai';
import {getStore, registerReducers, stubRedux, restoreRedux} from '@cdo/apps/redux';
import {ApplabInterfaceMode} from '@cdo/apps/applab/constants';
import {reducers, actions} from '@cdo/apps/applab/redux/applab';

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

  describe('interfaceMode', () => {
    it('exposes state on the interfaceMode key', () => {
      expect(store.getState().interfaceMode).to.be.defined;
    });

    describe('the initial state', () => {
      it('is always CODE mode', () => {
        expect(store.getState().interfaceMode).to.equal(ApplabInterfaceMode.CODE);
      });
    });

    describe('the changeInterfaceMode action', () => {
      it('can change to DESIGN mode', () => {
        store.dispatch(actions.changeInterfaceMode(ApplabInterfaceMode.DESIGN));
        expect(store.getState().interfaceMode).to.equal(ApplabInterfaceMode.DESIGN);
      });
      it('and to DATA mode', () => {
        store.dispatch(actions.changeInterfaceMode(ApplabInterfaceMode.DATA));
        expect(store.getState().interfaceMode).to.equal(ApplabInterfaceMode.DATA);
      });
      it('and back to CODE mode', () => {
        store.dispatch(actions.changeInterfaceMode(ApplabInterfaceMode.DATA));
        expect(store.getState().interfaceMode).not.to.equal(ApplabInterfaceMode.CODE);
        store.dispatch(actions.changeInterfaceMode(ApplabInterfaceMode.CODE));
        expect(store.getState().interfaceMode).to.equal(ApplabInterfaceMode.CODE);
      });
    });
  });

  describe('maker', () => {
    it('exposes state on the maker key', () => {
      expect(store.getState().maker).to.be.defined;
    });
  });
});
