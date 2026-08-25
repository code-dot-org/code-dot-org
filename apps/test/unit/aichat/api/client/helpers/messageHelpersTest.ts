import {
  AssetFetchError,
  assetToFilePart,
} from '@cdo/apps/aichat/api/client/helpers/fileHelpers';
import {formatChatMessage} from '@cdo/apps/aichat/api/client/helpers/messageHelpers';
import {AssetSource, ChatAsset, ChatMessage} from '@cdo/apps/aichat/types';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {AiInteractionStatus} from '@cdo/generated-scripts/sharedConstants';

const mockLogError = jest.fn();

jest.mock('@cdo/apps/lab2/Lab2Registry', () => ({
  __esModule: true,
  default: {
    getInstance: () => ({
      getMetricsReporter: () => ({logError: mockLogError}),
    }),
  },
}));

const asset: ChatAsset = {
  filename: 'generated-file-abc.png',
  source: AssetSource.PROJECT,
};

// status OK makes this a CompletedChatMessage, which carries a request id.
const message = (
  assets?: ChatAsset[],
  chatMessageText = 'make the sloth cuter'
): ChatMessage => ({
  role: Role.USER,
  status: AiInteractionStatus.OK,
  chatMessageText,
  timestamp: 1,
  requestId: 1,
  assets,
});

const buildAssetUrl = (a: ChatAsset) => `/v3/assets/channel-id/${a.filename}`;

// Stands in for the browser fetch that assetToFilePart uses.
const mockFetch = (init: {ok: boolean; status: number; body?: string}) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: init.ok,
    status: init.status,
    headers: new Map([['content-type', 'image/png']]),
    arrayBuffer: async () => new TextEncoder().encode(init.body ?? '').buffer,
  }) as unknown as typeof global.fetch;
};

describe('assetToFilePart', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('throws AssetFetchError when the asset is not found', async () => {
    mockFetch({ok: false, status: 404});

    await expect(assetToFilePart(asset, buildAssetUrl)).rejects.toThrow(
      AssetFetchError
    );
  });

  it('throws AssetFetchError when the response body is empty', async () => {
    mockFetch({ok: true, status: 200, body: ''});

    await expect(assetToFilePart(asset, buildAssetUrl)).rejects.toThrow(
      AssetFetchError
    );
  });

  it('returns a file part with the asset data when the fetch succeeds', async () => {
    mockFetch({ok: true, status: 200, body: 'png-bytes'});

    const filePart = await assetToFilePart(asset, buildAssetUrl);

    expect(filePart).toEqual({
      type: 'file',
      data: Buffer.from('png-bytes').toString('base64'),
      filename: 'generated-file-abc.png',
      mediaType: 'image/png',
    });
  });
});

describe('formatChatMessage', () => {
  beforeEach(() => {
    mockLogError.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('drops an unreadable asset when dropUnreadableAssets is set', async () => {
    mockFetch({ok: false, status: 404});

    const formatted = await formatChatMessage(message([asset]), buildAssetUrl, {
      dropUnreadableAssets: true,
    });

    // Only the text part survives -- crucially, no file part with empty data.
    expect(formatted?.content).toEqual([
      {type: 'text', text: 'make the sloth cuter'},
    ]);
    expect(mockLogError).toHaveBeenCalledTimes(1);
  });

  it('drops an asset whose URL cannot be built', async () => {
    const throwingBuildAssetUrl = () => {
      throw new Error('Either channel ID or level name must be provided');
    };

    const formatted = await formatChatMessage(
      message([asset]),
      throwingBuildAssetUrl,
      {dropUnreadableAssets: true}
    );

    expect(formatted?.content).toEqual([
      {type: 'text', text: 'make the sloth cuter'},
    ]);
    expect(mockLogError).toHaveBeenCalledTimes(1);
  });

  it('surfaces an unreadable asset by default', async () => {
    mockFetch({ok: false, status: 404});

    await expect(
      formatChatMessage(message([asset]), buildAssetUrl)
    ).rejects.toThrow(AssetFetchError);
    expect(mockLogError).not.toHaveBeenCalled();
  });

  it('returns undefined for an image-only message whose asset is unreadable', async () => {
    mockFetch({ok: false, status: 404});

    // Nothing survives: no text, and the only asset could not be read. The
    // model rejects a message with no parts, so it has to be left out.
    await expect(
      formatChatMessage(message([asset], ''), buildAssetUrl, {
        dropUnreadableAssets: true,
      })
    ).resolves.toBeUndefined();
  });

  it('omits the text part for an image-only message', async () => {
    mockFetch({ok: true, status: 200, body: 'png-bytes'});

    const formatted = await formatChatMessage(
      message([asset], ''),
      buildAssetUrl
    );

    // An empty text part is not content, and would make an otherwise empty
    // message look non-empty.
    expect(formatted?.content).toEqual([
      expect.objectContaining({type: 'file', filename: asset.filename}),
    ]);
  });

  it('treats whitespace-only text as no text', async () => {
    mockFetch({ok: false, status: 404});

    await expect(
      formatChatMessage(message([asset], '   \n  '), buildAssetUrl, {
        dropUnreadableAssets: true,
      })
    ).resolves.toBeUndefined();
  });

  it('returns undefined for a message with no text and no assets', async () => {
    await expect(
      formatChatMessage(message(undefined, ''), buildAssetUrl)
    ).resolves.toBeUndefined();
  });

  it('includes readable assets alongside the message text', async () => {
    mockFetch({ok: true, status: 200, body: 'png-bytes'});

    const formatted = await formatChatMessage(message([asset]), buildAssetUrl);

    expect(formatted?.role).toBe('user');
    expect(formatted?.content).toHaveLength(2);
    expect(formatted?.content[1]).toEqual(
      expect.objectContaining({type: 'file', filename: asset.filename})
    );
  });
});
