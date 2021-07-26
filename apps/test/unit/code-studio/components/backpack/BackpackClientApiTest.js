import {assert, expect} from '../../../../util/reconfiguredChai';
import sinon from 'sinon';
import BackpackClientApi from '@cdo/apps/code-studio/components/backpack/BackpackClientApi';

describe('BackpackClientApi', () => {
  const channelId = 'fake_channel_id';
  const sampleFileJson = {
    'test.java': {text: 'hello'},
    'test2.java': {text: 'hello'}
  };

  let server,
    backpackClientApi,
    fetchChannelIdStub,
    errorCallback,
    successCallback;

  const setSaveResponse = (status, filename) => {
    server.respondWith('put', `/v3/libraries/${channelId}/${filename}`, [
      status,
      {'Content-Type': 'application/json'},
      '{}'
    ]);
  };

  describe('save with provided channel id', () => {
    beforeEach(() => {
      server = sinon.fakeServer.create();
      backpackClientApi = new BackpackClientApi(channelId);
      fetchChannelIdStub = sinon.stub(backpackClientApi, 'fetchChannelId');
      errorCallback = sinon.fake();
      successCallback = sinon.fake();
    });

    afterEach(() => {
      server.restore();
      fetchChannelIdStub.restore();
    });

    it('does not fetch channel id', () => {
      setSaveResponse(200, 'test.java');
      backpackClientApi.saveFiles(
        sampleFileJson,
        ['test.java'],
        errorCallback,
        successCallback
      );
      server.respond();
      assert(fetchChannelIdStub.notCalled);
      expect(successCallback).to.have.been.calledOnce;
    });

    it('can save multiple files', () => {
      setSaveResponse(200, 'test.java');
      setSaveResponse(200, 'test2.java');
      backpackClientApi.saveFiles(
        sampleFileJson,
        ['test.java', 'test2.java'],
        errorCallback,
        successCallback
      );
      server.respond();
      expect(successCallback).to.have.been.calledOnce;
    });

    it('calls error on failure', () => {
      setSaveResponse(200, 'test.java');
      setSaveResponse(500, 'test2.java');
      backpackClientApi.saveFiles(
        sampleFileJson,
        ['test.java', 'test2.java'],
        errorCallback,
        successCallback
      );
      server.respond();
      server.respond();
      expect(errorCallback).to.have.been.calledOnce;
      assert(successCallback.notCalled);
    });
  });

  describe('save without provided channel id', () => {
    beforeEach(() => {
      server = sinon.fakeServer.create();
      backpackClientApi = new BackpackClientApi();
      fetchChannelIdStub = sinon.stub(backpackClientApi, 'fetchChannelId');
      errorCallback = sinon.fake();
      successCallback = sinon.fake();
    });

    afterEach(() => {
      server.restore();
      fetchChannelIdStub.restore();
    });

    it('fetches channel id', () => {
      setSaveResponse(200, 'test.java');
      backpackClientApi.saveFiles(
        sampleFileJson,
        ['test.java'],
        errorCallback,
        successCallback
      );
      server.respond();
      expect(fetchChannelIdStub).to.have.been.calledOnce;
    });
  });
});
