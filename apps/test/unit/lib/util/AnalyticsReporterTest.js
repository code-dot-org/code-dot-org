import {expect} from '../../../util/reconfiguredChai';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import * as utils from '@cdo/apps/utils';
import {stub} from 'sinon';

describe('AnalyticsReporter', () => {
  describe('formatUserId', () => {
    it('prepends environment in development', () => {
      stub(utils, 'currentLocation').returns({
        hostname: 'localhost-studio.code.org'
      });
      expect(analyticsReporter.formatUserId('0').startsWith('development')).to
        .be.true;
      utils.currentLocation.restore();
    });

    it('prepends environment in staging', () => {
      stub(utils, 'currentLocation').returns({
        hostname: 'staging-studio.code.org'
      });
      expect(analyticsReporter.formatUserId('0').startsWith('staging')).to.be
        .true;
      utils.currentLocation.restore();
    });

    it('prepends environment in test', () => {
      stub(utils, 'currentLocation').returns({
        hostname: 'test-studio.code.org'
      });
      expect(analyticsReporter.formatUserId('0').startsWith('test')).to.be.true;
      utils.currentLocation.restore();
    });

    it('prepends environment in adhoc', () => {
      stub(utils, 'currentLocation').returns({
        hostname: 'adhoc-studio.code.org'
      });
      expect(analyticsReporter.formatUserId('0').startsWith('adhoc')).to.be
        .true;
      utils.currentLocation.restore();
    });

    it('does not prepend environment in production', () => {
      stub(utils, 'currentLocation').returns({hostname: 'studio.code.org'});
      expect(analyticsReporter.formatUserId('0').startsWith('prod')).to.be
        .false;
      utils.currentLocation.restore();
    });

    it('formats short user ids to be five character', () => {
      stub(utils, 'currentLocation').returns({hostname: 'studio.code.org'});
      expect(analyticsReporter.formatUserId('1')).to.equal('00001');
      utils.currentLocation.restore();
    });

    it('does not change long user ids in production', () => {
      stub(utils, 'currentLocation').returns({hostname: 'studio.code.org'});
      expect(analyticsReporter.formatUserId('88888')).to.equal('88888');
      utils.currentLocation.restore();
    });
  });

  describe('shouldPutRecord', () => {
    it('shouldPutRecord return true if alwaysPut is true', () => {
      stub(utils, 'currentLocation').returns({
        hostname: 'localhost-studio.code.org'
      });
      expect(analyticsReporter.shouldPutRecord(true)).to.be.true;
      utils.currentLocation.restore();
    });

    it('shouldPutRecord returns true if production', () => {
      stub(utils, 'currentLocation').returns({hostname: 'studio.code.org'});
      expect(analyticsReporter.shouldPutRecord(false)).to.be.true;
      utils.currentLocation.restore();
    });

    it('shouldPutRecord returns false if development', () => {
      stub(utils, 'currentLocation').returns({
        hostname: 'localhost-studio.code.org'
      });
      expect(analyticsReporter.shouldPutRecord(false)).to.be.false;
      utils.currentLocation.restore();
    });
  });
});
