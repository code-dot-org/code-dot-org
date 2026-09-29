import cookies from 'js-cookie';
import {stub} from 'sinon'; // eslint-disable-line no-restricted-imports

import {
  findOrCreateStableId,
  formatUserId,
} from '@cdo/apps/metrics/statsigHelpers';
import * as utils from '@cdo/apps/utils';
import {StatsigStableIdKey} from '@cdo/generated-scripts/sharedConstants';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('StatsigReporter', () => {
  describe('findOrCreateStableId', () => {
    let createUuidStub;
    let getCookieStub;

    beforeEach(() => {
      createUuidStub = stub(utils, 'createUuid').returns('generated-stable-id');
      getCookieStub = stub(cookies, 'get');
    });

    afterEach(() => {
      createUuidStub.restore();
      getCookieStub.restore();
      localStorage.clear();
    });

    it('uses the existing cookie', () => {
      const stableId = 'existing-stable-id';
      getCookieStub.returns(stableId);

      expect(findOrCreateStableId()).to.equal(stableId);
      expect(getCookieStub).to.have.been.calledWith(StatsigStableIdKey);
      expect(createUuidStub).not.to.have.been.called;
    });

    it('generates an ID without restoring one from local storage', () => {
      const formerStableId = 'former-stable-id';
      localStorage.setItem(StatsigStableIdKey.toUpperCase(), formerStableId);
      localStorage.setItem('STATSIG_LOCAL_STORAGE_STABLE_ID', formerStableId);

      expect(findOrCreateStableId()).to.equal('generated-stable-id');
      expect(createUuidStub).to.have.been.calledOnce;
    });
  });

  describe('formatUserId', () => {
    it('prepends environment in test', () => {
      stub(utils, 'getEnvironment').returns('test');
      expect(formatUserId('0').startsWith('test')).to.be.true;
      utils.getEnvironment.restore();
    });

    it('does not prepend environment in production', () => {
      stub(utils, 'isProductionEnvironment').returns(true);
      expect(formatUserId('0').startsWith('prod')).to.be.false;
      utils.isProductionEnvironment.restore();
    });

    it('formats short user ids to be five character', () => {
      stub(utils, 'isProductionEnvironment').returns(true);
      expect(formatUserId('1')).to.equal('00001');
      utils.isProductionEnvironment.restore();
    });

    it('does not change long user ids in production', () => {
      stub(utils, 'isProductionEnvironment').returns(true);
      expect(formatUserId('88888')).to.equal('88888');
      utils.isProductionEnvironment.restore();
    });
  });
});
