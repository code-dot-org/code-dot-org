import cookies from 'js-cookie';
import {stub} from 'sinon'; // eslint-disable-line no-restricted-imports

import {
  findOrCreateStableId,
  formatUserId,
  isValidStableId,
} from '@cdo/apps/metrics/statsigHelpers';
import * as utils from '@cdo/apps/utils';
import {StatsigStableIdKey} from '@cdo/generated-scripts/sharedConstants';
import {api_statsig_stable_id_url} from '@cdo/generated-scripts/studioRoutes';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('statsigHelpers', () => {
  describe('isValidStableId', () => {
    const uuid = '37fdc3bf-8392-45d2-8810-7ea304d2d9c9';

    it('accepts generated UUID v4 values', () => {
      expect(isValidStableId(utils.createUuid())).to.be.true;
    });

    [uuid, uuid.toUpperCase(), '37fdc3bf-8392-45d2-0810-7ea304d2d9c9'].forEach(
      value => {
        it(`accepts ${value}`, () => {
          expect(isValidStableId(value)).to.be.true;
        });
      }
    );

    [
      undefined,
      null,
      123,
      {},
      [uuid],
      '',
      '<html>blocked</html>',
      '37fdc3bf-8392-15d2-8810-7ea304d2d9c9',
      'g7fdc3bf-8392-45d2-8810-7ea304d2d9c9',
      `${uuid}\n`,
      `\n${uuid}`,
      `${uuid}\r\n`,
      ` ${uuid} `,
      `${uuid}extra`,
    ].forEach(value => {
      it(`rejects ${JSON.stringify(value)}`, () => {
        expect(isValidStableId(value)).to.be.false;
      });
    });
  });

  describe('findOrCreateStableId', () => {
    const nativeRandomUUID = window.crypto.randomUUID;
    const nativeTimeout = AbortSignal.timeout;
    let timeoutStub;
    let controller;
    let getCookieStub;
    let removeCookieStub;
    let setCookieStub;
    let getStub;
    let response;
    let createUuidStub;
    let consoleErrorStub;
    const generatedStableId = 'a82143d8-82d7-4342-a9cb-d4f69563231a';
    const serverStableId = '0b26deae-cf8e-4af3-8b03-4534de3b781f';
    const invalidStableIds = [
      ['short HTML', '<html>blocked</html>'],
      ['large HTML', `<!DOCTYPE html><html>${'blocked'.repeat(1000)}</html>`],
      ['plain text', 'blocked'],
      ['a non-v4 UUID', '0b26deae-cf8e-1af3-8b03-4534de3b781f'],
      ['a trailing newline', `${serverStableId}\n`],
      ['surrounding spaces', ` ${serverStableId} `],
    ];

    beforeAll(() => {
      if (!nativeTimeout) {
        AbortSignal.timeout = () => {};
      }
      if (!nativeRandomUUID) {
        Object.defineProperty(window.crypto, 'randomUUID', {
          configurable: true,
          value: utils.createUuid,
        });
      }
    });

    afterAll(() => {
      if (!nativeTimeout) {
        delete AbortSignal.timeout;
      }
      if (!nativeRandomUUID) {
        delete window.crypto.randomUUID;
      }
    });

    beforeEach(() => {
      controller = new AbortController();
      timeoutStub = stub(AbortSignal, 'timeout').returns(controller.signal);
      window.OnetrustActiveGroups = 'C0002';
      getCookieStub = stub(cookies, 'get');
      removeCookieStub = stub(cookies, 'remove');
      setCookieStub = stub(cookies, 'set');
      response = {
        status: 200,
        get ok() {
          return this.status >= 200 && this.status < 300;
        },
        text: stub().resolves(''),
      };
      getStub = stub(window, 'fetch').resolves(response);
      createUuidStub = stub(utils, 'createUuid').returns(generatedStableId);
      consoleErrorStub = stub(console, 'error');
    });

    afterEach(() => {
      timeoutStub.restore();
      getCookieStub.restore();
      removeCookieStub.restore();
      setCookieStub.restore();
      getStub.restore();
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

    it('uses the existing cookie', async () => {
      const stableId = window.crypto.randomUUID();
      getCookieStub.returns(stableId);

      expect(await findOrCreateStableId()).to.equal(stableId);
      expectCookieSet(stableId);
      expect(getStub).not.to.have.been.called;
      expect(createUuidStub).not.to.have.been.called;
      expect(consoleErrorStub).not.to.have.been.called;
    });

    it('requests the generated Studio URL with a three-second timeout signal', async () => {
      await findOrCreateStableId();

      expect(getStub).to.have.been.calledWith(api_statsig_stable_id_url());
      expect(getStub).to.have.been.calledOnce;
      expect(timeoutStub).to.have.been.calledWithExactly(3000);
      expect(getStub.firstCall.args[1].signal).to.equal(controller.signal);
    });

    [undefined, ''].forEach(cookieValue => {
      it(`uses the server ID when the cookie is ${JSON.stringify(
        cookieValue
      )}`, async () => {
        const stableId = window.crypto.randomUUID();
        getCookieStub.returns(cookieValue);
        response.text.resolves(stableId);

        expect(await findOrCreateStableId()).to.equal(stableId);
        expect(getStub).to.have.been.calledWith(api_statsig_stable_id_url());
        expect(getStub).to.have.been.calledOnce;
        expectCookieSet(stableId);
        expect(createUuidStub).not.to.have.been.called;
        expect(consoleErrorStub).not.to.have.been.called;
      });
    });

    it('generates an ID when the server response is empty', async () => {
      expect(await findOrCreateStableId()).to.equal(generatedStableId);
      expectCookieSet(generatedStableId);
      expect(createUuidStub).to.have.been.calledOnce;
      expect(consoleErrorStub).not.to.have.been.called;
    });

    invalidStableIds.forEach(([description, invalidId]) => {
      it(`generates an ID when a successful response contains ${description}`, async () => {
        response.text.resolves(invalidId);

        expect(await findOrCreateStableId()).to.equal(generatedStableId);
        expectCookieSet(generatedStableId);
        expect(setCookieStub).to.have.been.calledOnce;
        expect(createUuidStub).to.have.been.calledOnce;
      });

      it(`replaces a cookie containing ${description} with the server ID`, async () => {
        getCookieStub.returns(invalidId);
        response.text.resolves(serverStableId);

        expect(await findOrCreateStableId()).to.equal(serverStableId);
        expect(getStub).to.have.been.calledOnce;
        expectCookieSet(serverStableId);
        expect(createUuidStub).not.to.have.been.called;
      });
    });

    it('replaces an invalid cookie when the server also returns HTML', async () => {
      getCookieStub.returns('<html>blocked</html>');
      response.text.resolves('<!DOCTYPE html><html>blocked</html>');

      expect(await findOrCreateStableId()).to.equal(generatedStableId);
      expectCookieSet(generatedStableId);
      getCookieStub.returns(generatedStableId);

      expect(await findOrCreateStableId()).to.equal(generatedStableId);
      expect(getStub).to.have.been.calledOnce;
      expect(createUuidStub).to.have.been.calledOnce;
    });

    it('replaces an invalid cookie when the request fails', async () => {
      getCookieStub.returns('<html>blocked</html>');
      getStub.rejects(new Error('Request failed'));

      expect(await findOrCreateStableId()).to.equal(generatedStableId);
      expectCookieSet(generatedStableId);
      expect(createUuidStub).to.have.been.calledOnce;
    });

    it('accepts uppercase IDs and unrestricted variants like the backend', async () => {
      const stableId = '0B26DEAE-CF8E-4AF3-0B03-4534DE3B781F';
      response.text.resolves(stableId);

      expect(await findOrCreateStableId()).to.equal(stableId);
      expectCookieSet(stableId);
      expect(createUuidStub).not.to.have.been.called;
    });

    it('generates an ID when the request fails', async () => {
      const error = new Error('Request failed');
      getStub.rejects(error);

      expect(await findOrCreateStableId()).to.equal(generatedStableId);
      expectCookieSet(generatedStableId);
      expect(consoleErrorStub).to.have.been.calledWith(
        'Failed to fetch Statsig stable ID:',
        error
      );
    });

    [0, 404, 500].forEach(status => {
      it(`logs status ${status} and generates an ID`, async () => {
        response.status = status;
        response.text.resolves('ignored');

        expect(await findOrCreateStableId()).to.equal(generatedStableId);
        expectCookieSet(generatedStableId);
        expect(createUuidStub).to.have.been.calledOnce;
        expect(consoleErrorStub).to.have.been.calledOnce;
        const [message, error] = consoleErrorStub.firstCall.args;
        expect(message).to.equal('Failed to fetch Statsig stable ID:');
        expect(error).to.be.instanceOf(Error);
        expect(error.message).to.equal(`${status}: ignored`);
      });
    });

    it('creates a cookie without restoring an ID from local storage', async () => {
      const formerStableId = window.crypto.randomUUID();
      localStorage.setItem(StatsigStableIdKey.toUpperCase(), formerStableId);
      localStorage.setItem('STATSIG_LOCAL_STORAGE_STABLE_ID', formerStableId);

      const stableId = await findOrCreateStableId();

      expect(stableId).to.equal(generatedStableId);
      expect(stableId).not.to.equal(formerStableId);
      expectCookieSet(stableId);
    });

    it('removes stored IDs when performance cookies are not allowed', async () => {
      window.OnetrustActiveGroups = '';
      localStorage.setItem(
        StatsigStableIdKey.toUpperCase(),
        window.crypto.randomUUID()
      );

      expect(await findOrCreateStableId()).to.be.undefined;
      expect(removeCookieStub).to.have.been.calledWith(StatsigStableIdKey, {
        path: '/',
        domain: '.code.org',
      });
      expect(localStorage.getItem(StatsigStableIdKey.toUpperCase())).to.be.null;
      expect(getCookieStub).not.to.have.been.called;
      expect(setCookieStub).not.to.have.been.called;
      expect(getStub).not.to.have.been.called;
      expect(createUuidStub).not.to.have.been.called;
    });

    it('waits for the response before saving and returning the ID', async () => {
      let resolveRequest;
      getStub.returns(
        new Promise(resolve => {
          resolveRequest = resolve;
        })
      );
      response.text.resolves(serverStableId);

      const pending = findOrCreateStableId();
      expect(getStub).to.have.been.calledOnce;
      expect(setCookieStub).not.to.have.been.called;
      resolveRequest(response);

      expect(await pending).to.equal(serverStableId);
      expect(setCookieStub).to.have.been.calledOnce;
      expectCookieSet(serverStableId);
    });

    it('uses the saved cookie without another request', async () => {
      response.text.resolves(serverStableId);
      const stableId = await findOrCreateStableId();
      getCookieStub.returns(stableId);
      expect(await findOrCreateStableId()).to.equal(stableId);
      expect(getStub).to.have.been.calledOnce;
    });

    it('fetches again when there is no saved cookie', async () => {
      response.text.resolves(serverStableId);
      expect(await findOrCreateStableId()).to.equal(serverStableId);
      expect(await findOrCreateStableId()).to.equal(serverStableId);
      expect(getStub).to.have.been.calledTwice;
    });

    it('generates an ID when the timeout signal aborts the request', async () => {
      getStub.callsFake(
        (url, {signal}) =>
          new Promise((resolve, reject) => {
            signal.addEventListener('abort', () => reject(signal.reason));
          })
      );
      const pending = findOrCreateStableId();
      const signal = getStub.firstCall.args[1].signal;
      expect(signal.aborted).to.be.false;
      const error = new DOMException('Timed out', 'TimeoutError');
      controller.abort(error);
      expect(await pending).to.equal(generatedStableId);
      expect(signal.aborted).to.be.true;
      expectCookieSet(generatedStableId);
      expect(consoleErrorStub).to.have.been.calledWith(
        'Failed to fetch Statsig stable ID:',
        error
      );
    });

    it('keeps the timeout active while reading the response body', async () => {
      response.text.callsFake(
        () =>
          new Promise((resolve, reject) => {
            getStub.firstCall.args[1].signal.addEventListener('abort', () =>
              reject(new Error('Aborted'))
            );
          })
      );
      const pending = findOrCreateStableId();
      await Promise.resolve();
      expect(response.text).to.have.been.calledOnce;
      controller.abort();
      expect(await pending).to.equal(generatedStableId);
    });

    it('does not change the saved ID when the signal expires after success', async () => {
      await findOrCreateStableId();
      controller.abort();
      expect(createUuidStub).to.have.been.calledOnce;
      expect(setCookieStub).to.have.been.calledOnce;
      expectCookieSet(generatedStableId);
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
