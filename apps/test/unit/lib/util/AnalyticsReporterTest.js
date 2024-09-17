import {stub} from 'sinon'; // eslint-disable-line no-restricted-imports

import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import * as utils from '@cdo/apps/utils';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('AnalyticsReporter', () => {
  describe('formatUserId', () => {
    it('prepends environment in development', () => {
      stub(utils, 'getEnvironment').returns('development');
      expect(analyticsReporter.formatUserId('0').startsWith('development')).to
        .be.true;
      utils.getEnvironment.restore();
    });

    it('prepends environment in staging', () => {
      stub(utils, 'getEnvironment').returns('staging');
      expect(analyticsReporter.formatUserId('0').startsWith('staging')).to.be
        .true;
      utils.getEnvironment.restore();
    });

    it('prepends environment in test', () => {
      stub(utils, 'getEnvironment').returns('test');
      expect(analyticsReporter.formatUserId('0').startsWith('test')).to.be.true;
      utils.getEnvironment.restore();
    });

    it('prepends environment in adhoc', () => {
      stub(utils, 'getEnvironment').returns('adhoc');
      expect(analyticsReporter.formatUserId('0').startsWith('adhoc')).to.be
        .true;
      utils.getEnvironment.restore();
    });

    it('does not prepend environment in production', () => {
      stub(utils, 'isProductionEnvironment').returns(true);
      expect(analyticsReporter.formatUserId('0').startsWith('prod')).to.be
        .false;
      utils.isProductionEnvironment.restore();
    });

    it('formats short user ids to be five character', () => {
      stub(utils, 'isProductionEnvironment').returns(true);
      expect(analyticsReporter.formatUserId('1')).to.equal('00001');
      utils.isProductionEnvironment.restore();
    });

    it('does not change long user ids in production', () => {
      stub(utils, 'isProductionEnvironment').returns(true);
      expect(analyticsReporter.formatUserId('88888')).to.equal('88888');
      utils.isProductionEnvironment.restore();
    });
  });

  describe('shouldPutRecord', () => {
    it('shouldPutRecord return true if alwaysPut is true', () => {
      stub(utils, 'getEnvironment').returns('development');
      expect(analyticsReporter.shouldPutRecord(true)).to.be.true;
      utils.getEnvironment.restore();
    });

    it('shouldPutRecord returns true if production', () => {
      stub(utils, 'isProductionEnvironment').returns(true);
      expect(analyticsReporter.shouldPutRecord(false)).to.be.true;
      utils.isProductionEnvironment.restore();
    });

    it('shouldPutRecord returns false if development', () => {
      stub(utils, 'getEnvironment').returns('development');
      expect(analyticsReporter.shouldPutRecord(false)).to.be.false;
      utils.getEnvironment.restore();
    });
  });
});
