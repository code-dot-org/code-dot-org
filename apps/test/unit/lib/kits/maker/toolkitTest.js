/** @file Tests for toolkit.js - Maker's main export */
import {expect} from '../../../../util/deprecatedChai';
import {
  stubRedux,
  restoreRedux,
  registerReducers,
  getStore
} from '@cdo/apps/redux';
import * as maker from '@cdo/apps/lib/kits/maker/toolkit';
import dropletConfig, {
  configMicrobit,
  configCircuitPlayground
} from '@cdo/apps/lib/kits/maker/dropletConfig';
import MakerError from '@cdo/apps/lib/kits/maker/MakerError';
import {reducer, isEnabled, isAvailable} from '@cdo/apps/lib/kits/maker/redux';

describe('maker/toolkit.js', () => {
  it('exports dropletConfig as-is', () => {
    expect(maker.dropletConfig).to.equal(dropletConfig);
  });

  it('exports configMicrobit as-is', () => {
    expect(maker.configMicrobit).to.equal(configMicrobit);
  });

  it('exports configCircuitPlayground as-is', () => {
    expect(maker.configCircuitPlayground).to.equal(configCircuitPlayground);
  });

  it('exports MakerError as-is', () => {
    expect(maker.MakerError).to.equal(MakerError);
  });

  describe('isAvailable()', () => {
    beforeEach(stubRedux);
    afterEach(restoreRedux);

    it('is false if no maker reducer was registered', () => {
      expect(isAvailable(getStore().getState())).to.be.false;
    });

    it('is true if a maker reducer was registered', () => {
      registerReducers({maker: reducer});
      expect(isAvailable(getStore().getState())).to.be.true;
    });
  });

  describe('isEnabled()', () => {
    beforeEach(stubRedux);
    afterEach(restoreRedux);

    it('is false if maker is not available', () => {
      expect(isEnabled(getStore().getState())).to.be.false;
    });

    it('is false by default when maker is available', () => {
      registerReducers({maker: reducer});
      expect(isEnabled(getStore().getState())).to.be.false;
    });

    it('is true after enabling maker', () => {
      registerReducers({maker: reducer});
      maker.enable();
      expect(isEnabled(getStore().getState())).to.be.true;
    });
  });

  describe('enable()', () => {
    beforeEach(stubRedux);
    afterEach(restoreRedux);

    it('throws if maker is not available', () => {
      expect(isAvailable(getStore().getState())).to.be.false;
      expect(() => maker.enable()).to.throw(
        MakerError,
        'Maker cannot be enabled: Its reducer was not registered.'
      );
    });

    it('enables maker if it was not enabled', () => {
      registerReducers({maker: reducer});
      expect(isEnabled(getStore().getState())).to.be.false;
      maker.enable();
      expect(isEnabled(getStore().getState())).to.be.true;
    });

    it('does nothing if maker was already enabled', () => {
      registerReducers({maker: reducer});
      maker.enable();
      expect(isEnabled(getStore().getState())).to.be.true;
      maker.enable();
      expect(isEnabled(getStore().getState())).to.be.true;
    });
  });
});
