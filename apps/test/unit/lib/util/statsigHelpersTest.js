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
    const nativeRandomUUID = window.crypto.randomUUID;
    let getCookieStub;
    let isDevelopmentEnvironmentStub;
    let removeCookieStub;
    let setCookieStub;
    let stableIdElement;

    beforeAll(() => {
      if (!nativeRandomUUID) {
        Object.defineProperty(window.crypto, 'randomUUID', {
          configurable: true,
          value: utils.createUuid,
        });
      }
    });

    afterAll(() => {
      if (!nativeRandomUUID) {
        delete window.crypto.randomUUID;
      }
    });

    beforeEach(() => {
      window.OnetrustActiveGroups = 'C0002';
      getCookieStub = stub(cookies, 'get');
      removeCookieStub = stub(cookies, 'remove');
      setCookieStub = stub(cookies, 'set');
    });

    afterEach(() => {
      getCookieStub.restore();
      isDevelopmentEnvironmentStub?.restore();
      removeCookieStub.restore();
      setCookieStub.restore();
      stableIdElement?.remove();
      localStorage.clear();
      delete window.OnetrustActiveGroups;
    });

    function expectCookieSet(stableId) {
      expect(setCookieStub).to.have.been.calledWith(
        StatsigStableIdKey,
        stableId
      );
      expect(setCookieStub.firstCall.args[2]).to.deep.equal({
        path: '/',
        domain: '.code.org',
        sameSite: 'Lax',
        secure: false,
        expires: 365,
      });
    }

    it('prefers the stable ID rendered by the server', () => {
      const stableId = window.crypto.randomUUID();
      stableIdElement = document.createElement('script');
      stableIdElement.dataset.statsigStableId = stableId;
      document.head.appendChild(stableIdElement);

      expect(findOrCreateStableId()).to.equal(stableId);
      expect(getCookieStub).not.to.have.been.called;
      expectCookieSet(stableId);
    });

    it('uses the existing cookie when the server ID is unavailable', () => {
      const stableId = window.crypto.randomUUID();
      getCookieStub.returns(stableId);

      expect(findOrCreateStableId()).to.equal(stableId);
      expectCookieSet(stableId);
    });

    it('creates a cookie without restoring an ID from local storage', () => {
      const formerStableId = window.crypto.randomUUID();
      localStorage.setItem(StatsigStableIdKey.toUpperCase(), formerStableId);
      localStorage.setItem('STATSIG_LOCAL_STORAGE_STABLE_ID', formerStableId);

      const stableId = findOrCreateStableId();

      expect(stableId).not.to.equal(formerStableId);
      expectCookieSet(stableId);
    });

    it('creates a cookie without consent in development', () => {
      window.OnetrustActiveGroups = '';

      const stableId = findOrCreateStableId();

      expect(stableId).not.to.be.undefined;
      expectCookieSet(stableId);
      expect(removeCookieStub).not.to.have.been.called;
    });

    it('removes the cookie when performance cookies are not allowed', () => {
      isDevelopmentEnvironmentStub = stub(
        utils,
        'isDevelopmentEnvironment'
      ).returns(false);
      window.OnetrustActiveGroups = '';

      expect(findOrCreateStableId()).to.be.undefined;
      expect(removeCookieStub).to.have.been.calledWith(StatsigStableIdKey, {
        path: '/',
        domain: '.code.org',
      });
      expect(getCookieStub).not.to.have.been.called;
      expect(setCookieStub).not.to.have.been.called;
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
