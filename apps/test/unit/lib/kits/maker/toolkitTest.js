/** @file Tests for toolkit.js - Maker's main export */
import {expect} from '../../../../util/configuredChai';
import {stubRedux, restoreRedux, registerReducers} from '@cdo/apps/redux';
import * as maker from '@cdo/apps/lib/kits/maker/toolkit';
import {reducer} from '@cdo/apps/lib/kits/maker/redux';
import * as dropletConfig from '@cdo/apps/lib/kits/maker/dropletConfig';
import MakerError from '@cdo/apps/lib/kits/maker/MakerError';

describe('maker/toolkit.js', () => {
  it('exports dropletConfig as-is', () => {
    expect(maker.dropletConfig).to.equal(dropletConfig);
  });

  it('exports MakerError as-is', () => {
    expect(maker.MakerError).to.equal(MakerError);
  });

  describe('isAvailable()', () => {
    beforeEach(stubRedux);
    afterEach(restoreRedux);

    it('is false if no maker reducer was registered', () => {
      expect(maker.isAvailable()).to.be.false;
    });

    it('is true if a maker reducer was registered', () => {
      registerReducers({maker: reducer});
      expect(maker.isAvailable()).to.be.true;
    });
  });

  describe('isEnabled()', () => {
    beforeEach(stubRedux);
    afterEach(restoreRedux);

    it('is false if maker is not available', () => {
      expect(maker.isEnabled()).to.be.false;
    });

    it('is false by default when maker is available', () => {
      registerReducers({maker: reducer});
      expect(maker.isEnabled()).to.be.false;
    });

    it('is true after enabling maker', () => {
      registerReducers({maker: reducer});
      maker.enable();
      expect(maker.isEnabled()).to.be.true;
    });
  });

  describe('enable()', () => {
    beforeEach(stubRedux);
    afterEach(restoreRedux);

    it('throws if maker is not available', () => {
      expect(maker.isAvailable()).to.be.false;
      expect(() => maker.enable()).to.throw(MakerError,
          'Maker cannot be enabled: Its reducer was not registered.');
    });

    it('enables maker if it was not enabled', () => {
      registerReducers({maker: reducer});
      expect(maker.isEnabled()).to.be.false;
      maker.enable();
      expect(maker.isEnabled()).to.be.true;
    });

    it('does nothing if maker was already enabled', () => {
      registerReducers({maker: reducer});
      maker.enable();
      expect(maker.isEnabled()).to.be.true;
      maker.enable();
      expect(maker.isEnabled()).to.be.true;
    });
  });
});
