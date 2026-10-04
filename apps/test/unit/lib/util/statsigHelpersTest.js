import cookies from 'js-cookie';
import {stub} from 'sinon'; // eslint-disable-line no-restricted-imports

import {
  findOrCreateStableId,
  formatUserId,
} from '@cdo/apps/metrics/statsigHelpers';
import * as utils from '@cdo/apps/utils';
import {StatsigStableIdKey} from '@cdo/generated-scripts/sharedConstants';
import {api_statsig_stable_id_url} from '@cdo/generated-scripts/studioRoutes';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('statsigHelpers', () => {
  describe('findOrCreateStableId', () => {
    const nativeRandomUUID = window.crypto.randomUUID;
    let getCookieStub;
    let removeCookieStub;
    let setCookieStub;
    let xhrStub;
    let request;
    let createUuidStub;
    let consoleErrorStub;
    const generatedStableId = 'a82143d8-82d7-4342-a9cb-d4f69563231a';

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
      request = {
        open: stub(),
        send: stub(),
        status: 200,
        responseText: '',
      };
      xhrStub = stub(window, 'XMLHttpRequest').returns(request);
      createUuidStub = stub(utils, 'createUuid').returns(generatedStableId);
      consoleErrorStub = stub(console, 'error');
    });

    afterEach(() => {
      getCookieStub.restore();
      removeCookieStub.restore();
      setCookieStub.restore();
      xhrStub.restore();
      createUuidStub.restore();
      consoleErrorStub.restore();
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
      });
    }

    it('uses the existing cookie', () => {
      const stableId = window.crypto.randomUUID();
      getCookieStub.returns(stableId);

      expect(findOrCreateStableId()).to.equal(stableId);
      expectCookieSet(stableId);
      expect(xhrStub).not.to.have.been.called;
      expect(createUuidStub).not.to.have.been.called;
      expect(consoleErrorStub).not.to.have.been.called;
    });

    it('requests the generated Studio URL synchronously', () => {
      findOrCreateStableId();

      expect(request.open).to.have.been.calledWith(
        'GET',
        api_statsig_stable_id_url(),
        false
      );
      expect(request.send).to.have.been.calledOnce;
    });

    [undefined, ''].forEach(cookieValue => {
      it(`uses the server ID when the cookie is ${JSON.stringify(
        cookieValue
      )}`, () => {
        const stableId = window.crypto.randomUUID();
        getCookieStub.returns(cookieValue);
        request.send.callsFake(() => {
          request.responseText = stableId;
        });

        expect(findOrCreateStableId()).to.equal(stableId);
        expect(request.open).to.have.been.calledWith(
          'GET',
          api_statsig_stable_id_url(),
          false
        );
        expect(request.send).to.have.been.calledOnce;
        expectCookieSet(stableId);
        expect(createUuidStub).not.to.have.been.called;
        expect(consoleErrorStub).not.to.have.been.called;
      });
    });

    it('generates an ID when the server response is empty', () => {
      expect(findOrCreateStableId()).to.equal(generatedStableId);
      expectCookieSet(generatedStableId);
      expect(createUuidStub).to.have.been.calledOnce;
      expect(consoleErrorStub).not.to.have.been.called;
    });

    it('generates an ID when the request fails', () => {
      const error = new Error('Request failed');
      request.send.throws(error);

      expect(findOrCreateStableId()).to.equal(generatedStableId);
      expectCookieSet(generatedStableId);
      expect(consoleErrorStub).to.have.been.calledWith(
        'Failed to fetch Statsig stable ID:',
        error
      );
    });

    [0, 201, 204, 404, 500].forEach(status => {
      it(`logs status ${status} and generates an ID`, () => {
        request.status = status;
        request.responseText = 'ignored';

        expect(findOrCreateStableId()).to.equal(generatedStableId);
        expectCookieSet(generatedStableId);
        expect(createUuidStub).to.have.been.calledOnce;
        expect(consoleErrorStub).to.have.been.calledWith(
          'Failed to fetch Statsig stable ID:',
          status,
          request.responseText
        );
      });
    });

    it('creates a cookie without restoring an ID from local storage', () => {
      const formerStableId = window.crypto.randomUUID();
      localStorage.setItem(StatsigStableIdKey.toUpperCase(), formerStableId);
      localStorage.setItem('STATSIG_LOCAL_STORAGE_STABLE_ID', formerStableId);

      const stableId = findOrCreateStableId();

      expect(stableId).to.equal(generatedStableId);
      expect(stableId).not.to.equal(formerStableId);
      expectCookieSet(stableId);
    });

    it('removes stored IDs when performance cookies are not allowed', () => {
      window.OnetrustActiveGroups = '';
      localStorage.setItem(
        StatsigStableIdKey.toUpperCase(),
        window.crypto.randomUUID()
      );

      expect(findOrCreateStableId()).to.be.undefined;
      expect(removeCookieStub).to.have.been.calledWith(StatsigStableIdKey, {
        path: '/',
        domain: '.code.org',
      });
      expect(localStorage.getItem(StatsigStableIdKey.toUpperCase())).to.be.null;
      expect(getCookieStub).not.to.have.been.called;
      expect(setCookieStub).not.to.have.been.called;
      expect(xhrStub).not.to.have.been.called;
      expect(createUuidStub).not.to.have.been.called;
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
