/** @file Tests for Maker Toolkit redux module */
import {expect} from '../../../../util/configuredChai';
import {createStore} from 'redux';
import {reducer, selectors, actions} from '@cdo/apps/lib/kits/maker/redux';

describe('Maker Toolkit redux module', () => {
  let store;

  beforeEach(() => {
    store = createStore(reducer);
  });

  describe('the initial state', () => {
    it('is disabled', () => {
      expect(selectors.isEnabled(store.getState())).to.be.false;
    });
  });

  describe('the enable action', () => {
    it('enables maker', () => {
      store.dispatch(actions.enable());
      expect(selectors.isEnabled(store.getState())).to.be.true;
    });
  });
});
