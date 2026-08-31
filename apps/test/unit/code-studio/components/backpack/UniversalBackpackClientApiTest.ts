import UniversalBackpackClientApi from '@cdo/apps/sharedComponents/backpack/UniversalBackpackClientApi';
import HttpClient from '@cdo/apps/util/HttpClient';

jest.mock('@cdo/apps/util/HttpClient', () => ({
  fetchJson: jest.fn(() => Promise.resolve({})),
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
