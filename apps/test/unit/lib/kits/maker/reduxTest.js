/** @file Tests for Maker Toolkit redux module */
import {createStore, combineReducers} from 'redux';

import {
  reducer,
  enable,
  startConnecting,
  reportConnected,
  reportConnectionError,
  disconnect,
  useVirtualBoardOnNextRun,
  isEnabled,
  isConnecting,
  isConnected,
  hasConnectionError,
  getConnectionError,
  shouldRunWithVirtualBoard,
} from '@cdo/apps/lib/kits/maker/redux';

describe('maker/redux.js', () => {
  let store;

  beforeEach(() => {
    store = createStore(combineReducers({maker: reducer}));
  });

  describe('without maker state', () => {
    it('can safely call selectors with empty state', () => {
      expect(isEnabled({})).toBe(false);
      expect(isConnecting({})).toBe(false);
      expect(isConnected({})).toBe(false);
      expect(hasConnectionError({})).toBe(false);
      expect(getConnectionError({})).toBeNull();
      expect(shouldRunWithVirtualBoard({})).toBe(false);
    });

    it('can safely call selectors with undefined state', () => {
      expect(isEnabled()).toBe(false);
      expect(isConnecting()).toBe(false);
      expect(isConnected()).toBe(false);
      expect(hasConnectionError()).toBe(false);
      expect(getConnectionError({})).toBeNull();
      expect(shouldRunWithVirtualBoard()).toBe(false);
    });
  });

  describe('the initial state', () => {
    it('is disabled', () => {
      expect(isEnabled(store.getState())).toBe(false);
    });

    it('is disconnected', () => {
      expect(isConnected(store.getState())).toBe(false);
      expect(isConnecting(store.getState())).toBe(false);
      expect(hasConnectionError(store.getState())).toBe(false);
    });

    it('runs with a real board', () => {
      expect(shouldRunWithVirtualBoard(store.getState())).toBe(false);
    });
  });

  describe('the enable action', () => {
    it('enables maker', () => {
      store.dispatch(enable());
      expect(isEnabled(store.getState())).toBe(true);
    });
  });

  describe('the startConnecting action', () => {
    it('sets the maker state to connecting', () => {
      store.dispatch(startConnecting());
      expect(isConnecting(store.getState())).toBe(true);
      expect(isConnected(store.getState())).toBe(false);
    });
  });

  describe('the reportConnected action', () => {
    it('sets the maker state to connected', () => {
      store.dispatch(reportConnected());
      expect(isConnecting(store.getState())).toBe(false);
      expect(isConnected(store.getState())).toBe(true);
    });

    it('sets maker to run with a fake board next time if already run with a fake board', () => {
      store.dispatch(useVirtualBoardOnNextRun());
      expect(shouldRunWithVirtualBoard(store.getState())).toBe(true);
      store.dispatch(reportConnected());
      expect(shouldRunWithVirtualBoard(store.getState())).toBe(true);
    });
  });

  describe('the reportConnectionError action', () => {
    it('sets the maker state to connection error', () => {
      const error = new Error('test');
      store.dispatch(reportConnectionError(error));
      expect(hasConnectionError(store.getState())).toBe(true);
    });

    it('stores the reported error', () => {
      const error = new Error('test');
      store.dispatch(reportConnectionError(error));
      expect(getConnectionError(store.getState())).toBe(error);
    });
  });

  describe('the disconnect action', () => {
    it('disconnects maker', () => {
      store.dispatch(disconnect());
      expect(isConnected(store.getState())).toBe(false);
    });

    it('clears any stored errors', () => {
      const error = new Error('test');
      store.dispatch(reportConnectionError(error));
      expect(getConnectionError(store.getState())).toBe(error);
      store.dispatch(disconnect());
      expect(getConnectionError(store.getState())).toBeNull();
    });
  });

  describe('the useVirtualBoardOnNextRun action', () => {
    it('sets maker to run with a virtual board', () => {
      store.dispatch(useVirtualBoardOnNextRun());
      expect(shouldRunWithVirtualBoard(store.getState())).toBe(true);
    });
  });
});
