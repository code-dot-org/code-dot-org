import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import BackpackClientApi from '@cdo/apps/code-studio/components/backpack/BackpackClientApi';

import {assert, expect} from '../../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('BackpackClientApi', () => {
  const channelId = 'fake_channel_id';
  const sampleFileJson = {
    'test.java': {text: 'hello'},
    'test2.java': {text: 'hello'},
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
      '{}',
    ]);
  };

  const setDeleteResponse = (status, filename) => {
    server.respondWith('delete', `/v3/libraries/${channelId}/${filename}`, [
      status,
      {'Content-Type': 'application/json'},
      '{}',
    ]);
  };

  describe('with provided channel id', () => {
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

    it('save does not fetch channel id', () => {
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

    it('save retries, then calls error on failure', () => {
      setSaveResponse(500, 'test2.java');
      backpackClientApi.saveFiles(
        sampleFileJson,
        ['test2.java'],
        errorCallback,
        successCallback
      );
      // need to respond twice because we retry failures
      server.respond();
      server.respond();
      expect(errorCallback).to.have.been.calledOnce;
      assert(successCallback.notCalled);
      // expect 2 calls to attempt to save test2.java
      expect(server.requests.length).to.equal(2);
    });

    it('can delete multiple files', () => {
      setDeleteResponse(200, 'test.java');
      setDeleteResponse(200, 'test2.java');
      backpackClientApi.deleteFiles(
        ['test.java', 'test2.java'],
        errorCallback,
        successCallback
      );
      server.respond();
      expect(successCallback).to.have.been.calledOnce;
    });

    it('delete retries, then calls error on failure', () => {
      setDeleteResponse(500, 'test2.java');
      backpackClientApi.deleteFiles(
        ['test2.java'],
        errorCallback,
        successCallback
      );
      // need to respond twice because we retry failures
      server.respond();
      server.respond();
      expect(errorCallback).to.have.been.calledOnce;
      assert(successCallback.notCalled);
      // expect 2 calls to attempt to save test2.java
      expect(server.requests.length).to.equal(2);
    });
  });

  describe('without provided channel id', () => {
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

    it('save fetches channel id', () => {
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

    it('get files calls error callback', () => {
      backpackClientApi.getFileList(errorCallback, successCallback);
      expect(errorCallback).to.have.been.calledOnce;
      assert(successCallback.notCalled);
    });

    it('fetch file calls error callback', () => {
      backpackClientApi.fetchFile('test.java', errorCallback, successCallback);
      expect(errorCallback).to.have.been.calledOnce;
      assert(successCallback.notCalled);
    });
  });
});
