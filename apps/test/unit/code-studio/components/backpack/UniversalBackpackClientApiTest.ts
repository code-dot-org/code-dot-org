import {BackpackEvent} from '@cdo/apps/sharedComponents/backpack/types';
import UniversalBackpackClientApi from '@cdo/apps/sharedComponents/backpack/UniversalBackpackClientApi';
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

describe('UniversalBackpackClientApi (jest)', () => {
  const universalChannelId = 'universal_channel_id';
  const javalabChannelId = 'javalab_channel_id';

  let universalBackpackClientApi: UniversalBackpackClientApi;

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
    universalBackpackClientApi = new UniversalBackpackClientApi();
  });

  it('fetchChannels stores the universal channel and every backpack', async () => {
    setChannelResponses({
      universal: universalChannelId,
      javalab: javalabChannelId,
    });

    await universalBackpackClientApi.fetchChannels();

    expect(universalBackpackClientApi.channelId).toBe(universalChannelId);
    expect(universalBackpackClientApi.hasBackpack()).toBe(true);
    expect(universalBackpackClientApi.channelIdsByAppType).toEqual({
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

    const fileLists = await universalBackpackClientApi.getFileLists();

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
    await universalBackpackClientApi.fetchChannels();
    setFileListResponse({[universalChannelId]: []});

    await universalBackpackClientApi.getFileLists();

    expect(HttpClient.fetchJson).toHaveBeenCalledTimes(3);
  });

  it('saveFiles writes to the universal backpack', async () => {
    setChannelResponses({
      universal: universalChannelId,
      javalab: javalabChannelId,
    });
    const onSuccess = jest.fn();

    await universalBackpackClientApi.saveFiles(
      {'shared.java': {text: 'hello'}},
      ['shared.java'],
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

    await universalBackpackClientApi.deleteFiles(
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

    await universalBackpackClientApi.fetchFile(
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

    await universalBackpackClientApi.deleteFiles(
      'javalab',
      ['old.java'],
      onError,
      jest.fn()
    );

    expect(onError).toHaveBeenCalled();
    expect(HttpClient.delete).not.toHaveBeenCalled();
  });

  it('getFileFetchUrl names the given backpack', async () => {
    setChannelResponses({
      universal: universalChannelId,
      javalab: javalabChannelId,
    });
    await universalBackpackClientApi.fetchChannels();

    expect(
      universalBackpackClientApi.getFileFetchUrl('javalab', 'old.java')
    ).toBe(`/v3/libraries/${javalabChannelId}/old.java`);
    expect(
      universalBackpackClientApi.getFileFetchUrl('pythonlab', 'old.py')
    ).toBeUndefined();
  });

  it('relays events from every backpack to its own listeners', async () => {
    setChannelResponses({
      universal: universalChannelId,
      javalab: javalabChannelId,
    });
    const listener = jest.fn();
    universalBackpackClientApi.addEventListener(listener);

    await universalBackpackClientApi.deleteFiles(
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

    const fileLists = await universalBackpackClientApi.getFileLists();

    expect(fileLists).toEqual({universal: ['shared.java']});
  });
});
