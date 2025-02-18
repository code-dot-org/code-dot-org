/** @file Tests for toolkit.js - Maker's main export */
import dropletConfig, {
  configMicrobit,
  configCircuitPlayground,
} from '@cdo/apps/maker/dropletConfig';
import MakerError from '@cdo/apps/maker/MakerError';
import {reducer, isEnabled, isAvailable} from '@cdo/apps/maker/redux';
import * as maker from '@cdo/apps/maker/toolkit';
import {
  stubRedux,
  restoreRedux,
  registerReducers,
  getStore,
} from '@cdo/apps/redux';

describe('maker/toolkit.js', () => {
  it('exports dropletConfig as-is', () => {
    expect(maker.dropletConfig).toBe(dropletConfig);
  });

  it('exports configMicrobit as-is', () => {
    expect(maker.configMicrobit).toBe(configMicrobit);
  });

  it('exports configCircuitPlayground as-is', () => {
    expect(maker.configCircuitPlayground).toBe(configCircuitPlayground);
  });

  it('exports MakerError as-is', () => {
    expect(maker.MakerError).toBe(MakerError);
  });

  describe('isAvailable()', () => {
    beforeEach(stubRedux);
    afterEach(restoreRedux);

    it('is false if no maker reducer was registered', () => {
      expect(isAvailable(getStore().getState())).toBe(false);
    });

    it('is true if a maker reducer was registered', () => {
      registerReducers({maker: reducer});
      expect(isAvailable(getStore().getState())).toBe(true);
    });
  });

  describe('isEnabled()', () => {
    beforeEach(stubRedux);
    afterEach(restoreRedux);

    it('is false if maker is not available', () => {
      expect(isEnabled(getStore().getState())).toBe(false);
    });

    it('is false by default when maker is available', () => {
      registerReducers({maker: reducer});
      expect(isEnabled(getStore().getState())).toBe(false);
    });

    it('is true after enabling maker', () => {
      registerReducers({maker: reducer});
      maker.enable();
      expect(isEnabled(getStore().getState())).toBe(true);
    });
  });

  describe('enable()', () => {
    beforeEach(stubRedux);
    afterEach(restoreRedux);

    it('throws if maker is not available', () => {
      expect(isAvailable(getStore().getState())).toBe(false);
      expect(() => maker.enable()).toThrow(MakerError);
    });

    it('enables maker if it was not enabled', () => {
      registerReducers({maker: reducer});
      expect(isEnabled(getStore().getState())).toBe(false);
      maker.enable();
      expect(isEnabled(getStore().getState())).toBe(true);
    });

    it('does nothing if maker was already enabled', () => {
      registerReducers({maker: reducer});
      maker.enable();
      expect(isEnabled(getStore().getState())).toBe(true);
      maker.enable();
      expect(isEnabled(getStore().getState())).toBe(true);
    });
  });
});
