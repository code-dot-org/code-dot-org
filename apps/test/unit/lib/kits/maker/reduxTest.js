/** @file Tests for Maker Toolkit redux module */
import {expect} from '../../../../util/configuredChai';
import {createStore, combineReducers} from 'redux';
import {reducer, enable, isEnabled} from '@cdo/apps/lib/kits/maker/redux';

describe('Maker Toolkit redux module', () => {
  let store;

  beforeEach(() => {
    store = createStore(combineReducers({maker: reducer}));
  });

  describe('the initial state', () => {
    it('is disabled', () => {
      expect(isEnabled(store.getState())).to.be.false;
    });
  });

  describe('the enable action', () => {
    it('enables maker', () => {
      store.dispatch(enable());
      expect(isEnabled(store.getState())).to.be.true;
    });
  });
});
