import BackpackClientApi from '@cdo/apps/sharedComponents/backpack/BackpackClientApi';
import HttpClient from '@cdo/apps/util/HttpClient';

jest.mock('@cdo/apps/util/HttpClient', () => ({
  fetchJson: jest.fn(() => Promise.resolve({})),
  put: jest.fn(() => Promise.resolve({})),
  delete: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve({})),
}));

describe('BackpackClientApi (jest)', () => {
  const channelId = 'fake_channel_id';
  const appType = 'javalab';
  const sampleFileJson: {[filename: string]: {text: string}} = {
    'test.java': {text: 'hello'},
    'test2.java': {text: 'hello'},
  };

  let backpackClientApi: BackpackClientApi;
  let errorCallback: jest.Mock;
  let successCallback: jest.Mock;

  const setPutResolveOnce = () =>
    (HttpClient.put as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({})
    );
  const setPutRejectOnce = () =>
    (HttpClient.put as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error('fail'))
    );

  const setDeleteResolveOnce = () =>
    (HttpClient.delete as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({})
    );
  const setDeleteRejectOnce = () =>
    (HttpClient.delete as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error('fail'))
    );
  const setGetResolveOnce = (fileContent: string) =>
    (HttpClient.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        text: jest.fn().mockResolvedValueOnce(fileContent),
      })
    );
  const setGetRejectOnce = () =>
    (HttpClient.get as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error('fail'))
    );

  beforeEach(() => {
    jest.clearAllMocks();
    errorCallback = jest.fn();
    successCallback = jest.fn();
  });

  describe('with provided channel id', () => {
    beforeEach(() => {
      backpackClientApi = new BackpackClientApi(appType, channelId);
    });

    it('save does not fetch channel id', async () => {
      setPutResolveOnce();
      const fetchChannelIdSpy = jest.spyOn(backpackClientApi, 'fetchChannelId');

      backpackClientApi.saveFiles(
        sampleFileJson,
        ['test.java'],
        errorCallback,
        successCallback
      );

      await Promise.resolve();
      expect(fetchChannelIdSpy).not.toHaveBeenCalled();
      expect(successCallback).toHaveBeenCalledTimes(1);
      expect(errorCallback).not.toHaveBeenCalled();
      fetchChannelIdSpy.mockRestore();
    });

    it('can save multiple files', async () => {
      setPutResolveOnce();
      setPutResolveOnce();

      backpackClientApi.saveFiles(
        sampleFileJson,
        ['test.java', 'test2.java'],
        errorCallback,
        successCallback
      );

      await Promise.resolve();
      expect(successCallback).toHaveBeenCalledTimes(1);
      expect(errorCallback).not.toHaveBeenCalled();
      expect(HttpClient.put as jest.Mock).toHaveBeenCalledTimes(2);
    });

    it('save retries, then calls error on failure', async () => {
      setPutRejectOnce();
      setPutRejectOnce(); // retry fails

      backpackClientApi.saveFiles(
        sampleFileJson,
        ['test2.java'],
        errorCallback,
        successCallback
      );

      await Promise.resolve();
      await Promise.resolve();
      expect(errorCallback).toHaveBeenCalledTimes(1);
      expect(successCallback).not.toHaveBeenCalled();
      expect(HttpClient.put as jest.Mock).toHaveBeenCalledTimes(2);
    });

    it('can delete multiple files', async () => {
      setDeleteResolveOnce();
      setDeleteResolveOnce();

      backpackClientApi.deleteFiles(
        ['test.java', 'test2.java'],
        errorCallback,
        successCallback
      );

      await Promise.resolve();
      expect(successCallback).toHaveBeenCalledTimes(1);
      expect(errorCallback).not.toHaveBeenCalled();
      expect(HttpClient.delete as jest.Mock).toHaveBeenCalledTimes(2);
    });

    it('delete retries, then calls error on failure', async () => {
      setDeleteRejectOnce();
      setDeleteRejectOnce(); // retry fails

      backpackClientApi.deleteFiles(
        ['test2.java'],
        errorCallback,
        successCallback
      );

      await Promise.resolve();
      await Promise.resolve();
      expect(errorCallback).toHaveBeenCalledTimes(1);
      expect(successCallback).not.toHaveBeenCalled();
      expect(HttpClient.delete as jest.Mock).toHaveBeenCalledTimes(2);
    });

    it('saveCodebridgeFileFromUrl uploads file fetched from URL and calls success', async () => {
      // Mock a successful GET that returns a blob
      (HttpClient.get as jest.Mock).mockResolvedValueOnce(
        Promise.resolve({
          ok: true,
          blob: jest
            .fn()
            .mockResolvedValueOnce(new Blob(['data'], {type: 'text/plain'})),
        })
      );
      setPutResolveOnce();

      await backpackClientApi.saveCodebridgeFileFromUrl(
        'fromUrl.txt',
        'https://example.com/file.txt',
        errorCallback,
        successCallback
      );

      expect(HttpClient.get).toHaveBeenCalledWith(
        'https://example.com/file.txt'
      );
      expect(HttpClient.put).toHaveBeenCalledWith(
        `/v3/libraries/${channelId}/fromUrl.txt`,
        expect.any(File)
      );
      expect(errorCallback).not.toHaveBeenCalled();
      expect(successCallback).toHaveBeenCalledTimes(1);
    });

    it('saveCodebridgeFileFromUrl calls error when GET throws, does not upload', async () => {
      (HttpClient.get as jest.Mock).mockRejectedValueOnce(new Error('network'));

      await backpackClientApi.saveCodebridgeFileFromUrl(
        'fromUrl.txt',
        'https://example.com/file.txt',
        errorCallback,
        successCallback
      );

      expect(HttpClient.put).not.toHaveBeenCalled();
      expect(errorCallback).toHaveBeenCalledTimes(1);
      expect(successCallback).not.toHaveBeenCalled();
    });

    it('fetch file calls success callback on successful fetch', async () => {
      setGetResolveOnce('file contents');

      await backpackClientApi.fetchFile(
        'test.java',
        errorCallback,
        successCallback
      );

      expect(successCallback).toHaveBeenCalledTimes(1);
      expect(successCallback).toHaveBeenCalledWith('file contents');
      expect(errorCallback).not.toHaveBeenCalled();
    });

    it('fetch file calls error callback on failed fetch', async () => {
      setGetRejectOnce();

      await backpackClientApi.fetchFile(
        'test.java',
        errorCallback,
        successCallback
      );

      expect(errorCallback).toHaveBeenCalledTimes(1);
      expect(successCallback).not.toHaveBeenCalled();
    });
  });

  describe('without provided channel id', () => {
    beforeEach(() => {
      backpackClientApi = new BackpackClientApi(appType, null);
    });

    it('save fetches channel id', async () => {
      const fetchChannelIdSpy = jest
        .spyOn(backpackClientApi, 'fetchChannelId')
        .mockImplementation((cb: () => void) => {
          backpackClientApi.channelId = channelId;
          cb();
        });

      setPutResolveOnce();

      backpackClientApi.saveFiles(
        sampleFileJson,
        ['test.java'],
        errorCallback,
        successCallback
      );

      await Promise.resolve();
      expect(fetchChannelIdSpy).toHaveBeenCalledTimes(1);
      expect(successCallback).toHaveBeenCalledTimes(1);
      expect(errorCallback).not.toHaveBeenCalled();

      fetchChannelIdSpy.mockRestore();
    });

    it('get files calls error callback', () => {
      backpackClientApi.getFileList(errorCallback, successCallback);
      expect(errorCallback).toHaveBeenCalledTimes(1);
      expect(successCallback).not.toHaveBeenCalled();
    });

    it('fetch file calls error callback', async () => {
      backpackClientApi.fetchFile('test.java', errorCallback, successCallback);
      await Promise.resolve();
      expect(errorCallback).toHaveBeenCalledTimes(1);
      expect(successCallback).not.toHaveBeenCalled();
    });
  });
});
