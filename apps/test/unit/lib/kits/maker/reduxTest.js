/** @file Tests for Maker Toolkit redux module */
import {expect} from '../../../../util/configuredChai';
import {createStore, combineReducers} from 'redux';
import {
  reducer,
  enable,
  startConnecting,
  reportConnected,
  reportConnectionError,
  disconnect,
  isEnabled,
  isConnecting,
  isConnected,
  hasConnectionError
} from '@cdo/apps/lib/kits/maker/redux';

describe('maker/redux.js', () => {
  let store;

  beforeEach(() => {
    store = createStore(combineReducers({maker: reducer}));
  });

  describe('without maker state', () => {
    it('can safely call selectors with empty state', () => {
      expect(isEnabled({})).to.be.false;
      expect(isConnecting({})).to.be.false;
      expect(isConnected({})).to.be.false;
      expect(hasConnectionError({})).to.be.false;
    });

    it('can safely call selectors with undefined state', () => {
      expect(isEnabled()).to.be.false;
      expect(isConnecting()).to.be.false;
      expect(isConnected()).to.be.false;
      expect(hasConnectionError()).to.be.false;
    });
  });

  describe('the initial state', () => {
    it('is disabled', () => {
      expect(isEnabled(store.getState())).to.be.false;
    });

    it('is disconnected', () => {
      expect(isConnected(store.getState())).to.be.false;
      expect(isConnecting(store.getState())).to.be.false;
      expect(hasConnectionError(store.getState())).to.be.false;
    });
  });

  describe('the enable action', () => {
    it('enables maker', () => {
      store.dispatch(enable());
      expect(isEnabled(store.getState())).to.be.true;
    });
  });

  describe('the startConnecting action', () => {
    it('sets the maker state to connecting', () => {
      store.dispatch(startConnecting());
      expect(isConnecting(store.getState())).to.be.true;
      expect(isConnected(store.getState())).to.be.false;
    });
  });

  describe('the reportConnected action', () => {
    it('sets the maker state to connected', () => {
      store.dispatch(reportConnected());
      expect(isConnecting(store.getState())).to.be.false;
      expect(isConnected(store.getState())).to.be.true;
    });
  });

  describe('the reportConnectionError action', () => {
    it('sets the maker state to connection error', () => {
      store.dispatch(reportConnectionError());
      expect(hasConnectionError(store.getState())).to.be.true;
    });
  });

  describe('the disconnect action', () => {
    it('disconnects maker', () => {
      store.dispatch(disconnect());
      expect(isConnected(store.getState())).to.be.false;
    });
  });
});
