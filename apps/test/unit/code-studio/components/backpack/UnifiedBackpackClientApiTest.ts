import {BackpackEvent} from '@cdo/apps/sharedComponents/backpack/types';
import UnifiedBackpackClientApi from '@cdo/apps/sharedComponents/backpack/UnifiedBackpackClientApi';
import HttpClient from '@cdo/apps/util/HttpClient';

// The api hands file writes off to a per-backpack client, so the callbacks it
// passes along resolve a tick after the call we await.
const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

jest.mock('@cdo/apps/util/HttpClient', () => ({
  fetchJson: jest.fn(() => Promise.resolve({})),
  put: jest.fn(() => Promise.resolve({})),
  delete: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve({})),
}));

describe('UnifiedBackpackClientApi (jest)', () => {
  const universalChannelId = 'universal_channel_id';
  const javalabChannelId = 'javalab_channel_id';

  let unifiedBackpackClientApi: UnifiedBackpackClientApi;

  const fileMetadata = (filename: string) => ({
    filename,
    category: 'application',
    size: 10,
    timestamp: '2026-08-31T00:00:00.000Z',
  });

  // Responses for the two channel requests, in the order the api makes them.
  const setChannelResponses = (channels: {[appType: string]: string}) => {
    (HttpClient.fetchJson as jest.Mock)
      .mockImplementationOnce(() =>
        Promise.resolve({value: {channel: universalChannelId}})
      )
      .mockImplementationOnce(() => Promise.resolve({value: {channels}}));
  };

  const setFileListResponse = (fileLists: {
    [channelId: string]: ReturnType<typeof fileMetadata>[] | null;
  }) =>
    (HttpClient.fetchJson as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({value: fileLists})
    );

  beforeEach(() => {
    jest.clearAllMocks();
    unifiedBackpackClientApi = new UnifiedBackpackClientApi();
  });

  it('fetchChannels stores the universal channel and every backpack', async () => {
    setChannelResponses({
      universal: universalChannelId,
      javalab: javalabChannelId,
    });

    await unifiedBackpackClientApi.fetchChannels();

    expect(unifiedBackpackClientApi.channelId).toBe(universalChannelId);
    expect(unifiedBackpackClientApi.hasBackpack()).toBe(true);
    expect(unifiedBackpackClientApi.channelIdsByAppType).toEqual({
      universal: universalChannelId,
      javalab: javalabChannelId,
    });
    expect(HttpClient.fetchJson).toHaveBeenCalledWith('/backpacks/channel');
    expect(HttpClient.fetchJson).toHaveBeenCalledWith('/backpacks/channels');
  });

  it('getFileLists fetches every backpack in one request, indexed by app type', async () => {
    setChannelResponses({
      universal: universalChannelId,
      javalab: javalabChannelId,
    });
    setFileListResponse({
      [universalChannelId]: [fileMetadata('shared.java')],
      [javalabChannelId]: [
        fileMetadata('old.java'),
        fileMetadata('older.java'),
      ],
    });

    const fileLists = await unifiedBackpackClientApi.getFileLists();

    expect(fileLists).toEqual({
      universal: ['shared.java'],
      javalab: ['old.java', 'older.java'],
    });
    expect(HttpClient.fetchJson).toHaveBeenLastCalledWith(
      `/v3/libraries?channels=${universalChannelId},${javalabChannelId}`
    );
  });

  it('getFileLists does not refetch channels it already has', async () => {
    setChannelResponses({universal: universalChannelId});
    await unifiedBackpackClientApi.fetchChannels();
    setFileListResponse({[universalChannelId]: []});

    await unifiedBackpackClientApi.getFileLists();

    expect(HttpClient.fetchJson).toHaveBeenCalledTimes(3);
  });

  it('saveFile writes to the universal backpack', async () => {
    setChannelResponses({
      universal: universalChannelId,
      javalab: javalabChannelId,
    });
    const onSuccess = jest.fn();

    await unifiedBackpackClientApi.saveFile(
      'shared.java',
      'hello',
      jest.fn(),
      onSuccess
    );
    await flushPromises();

    expect(HttpClient.put).toHaveBeenCalledWith(
      `/v3/libraries/${universalChannelId}/shared.java`,
      'hello'
    );
    expect(onSuccess).toHaveBeenCalled();
  });

  it('deleteFiles deletes from the named backpack', async () => {
    setChannelResponses({
      universal: universalChannelId,
      javalab: javalabChannelId,
    });
    const onSuccess = jest.fn();

    await unifiedBackpackClientApi.deleteFiles(
      'javalab',
      ['old.java'],
      jest.fn(),
      onSuccess
    );
    await flushPromises();

    expect(HttpClient.delete).toHaveBeenCalledWith(
      `/v3/libraries/${javalabChannelId}/old.java`
    );
    expect(onSuccess).toHaveBeenCalled();
  });

  it('fetchFile reads from the named backpack', async () => {
    setChannelResponses({
      universal: universalChannelId,
      javalab: javalabChannelId,
    });
    (HttpClient.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({text: jest.fn().mockResolvedValueOnce('file contents')})
    );
    const onSuccess = jest.fn();

    await unifiedBackpackClientApi.fetchFile(
      'javalab',
      'old.java',
      jest.fn(),
      onSuccess
    );
    await flushPromises();

    expect((HttpClient.get as jest.Mock).mock.calls[0][0]).toContain(
      `/v3/libraries/${javalabChannelId}/old.java`
    );
    expect(onSuccess).toHaveBeenCalledWith('file contents');
  });

  it('reads and deletes call back with an error for a backpack the user does not have', async () => {
    setChannelResponses({universal: universalChannelId});
    const onError = jest.fn();

    await unifiedBackpackClientApi.deleteFiles(
      'javalab',
      ['old.java'],
      onError,
      jest.fn()
    );

    expect(onError).toHaveBeenCalled();
    expect(HttpClient.delete).not.toHaveBeenCalled();
  });

  it('reports a failed channel request through onError', async () => {
    (HttpClient.fetchJson as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error('no channel for you'))
    );
    const onError = jest.fn();

    await unifiedBackpackClientApi.saveFile(
      'shared.java',
      'hello',
      onError,
      jest.fn()
    );

    expect(onError).toHaveBeenCalledWith(new Error('no channel for you'));
    expect(HttpClient.put).not.toHaveBeenCalled();
  });

  it('rethrows a failed channel request when there is no error callback', async () => {
    (HttpClient.fetchJson as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error('no channel for you'))
    );

    await expect(
      unifiedBackpackClientApi.saveFileFromUrl('shared.java', 'https://x/y')
    ).rejects.toThrow('no channel for you');
  });

  it('getFileLists rejects when the channel request fails', async () => {
    (HttpClient.fetchJson as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error('no channel for you'))
    );

    await expect(unifiedBackpackClientApi.getFileLists()).rejects.toThrow(
      'no channel for you'
    );
  });

  it('getFileFetchUrl names the given backpack', async () => {
    setChannelResponses({
      universal: universalChannelId,
      javalab: javalabChannelId,
    });
    await unifiedBackpackClientApi.fetchChannels();

    expect(
      unifiedBackpackClientApi.getFileFetchUrl('javalab', 'old.java')
    ).toBe(`/v3/libraries/${javalabChannelId}/old.java`);
    expect(
      unifiedBackpackClientApi.getFileFetchUrl('pythonlab', 'old.py')
    ).toBeUndefined();
  });

  it('relays events from every backpack to its own listeners', async () => {
    setChannelResponses({
      universal: universalChannelId,
      javalab: javalabChannelId,
    });
    const listener = jest.fn();
    unifiedBackpackClientApi.addEventListener(listener);

    await unifiedBackpackClientApi.deleteFiles(
      'javalab',
      ['old.java'],
      jest.fn(),
      jest.fn()
    );
    await flushPromises();

    expect(listener).toHaveBeenCalledWith(
      BackpackEvent.FileDeleted,
      'old.java'
    );
  });

  it('getFileLists leaves out a backpack the server could not read', async () => {
    setChannelResponses({
      universal: universalChannelId,
      javalab: javalabChannelId,
    });
    setFileListResponse({
      [universalChannelId]: [fileMetadata('shared.java')],
      [javalabChannelId]: null,
    });

    const fileLists = await unifiedBackpackClientApi.getFileLists();

    expect(fileLists).toEqual({universal: ['shared.java']});
  });
});
