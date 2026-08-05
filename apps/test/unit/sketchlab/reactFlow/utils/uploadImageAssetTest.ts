import {
  getAppOptionsEditingExemplar,
  getIsStartMode,
} from '@cdo/apps/lab2/projects/utils';
import {
  generateImageAssetUploadUrl,
  uploadImageAsset,
} from '@cdo/apps/sketchlab/reactFlow/utils/uploadImageAsset';
import HttpClient from '@cdo/apps/util/HttpClient';

jest.mock('@cdo/apps/util/HttpClient', () => ({
  put: jest.fn(),
  post: jest.fn(),
}));

jest.mock('@cdo/apps/lab2/projects/utils', () => ({
  getIsStartMode: jest.fn(() => false),
  getAppOptionsEditingExemplar: jest.fn(() => false),
}));

jest.mock('@cdo/apps/utils', () => ({
  createUuid: jest.fn(() => 'uuid-1'),
}));

const mockGetIsStartMode = getIsStartMode as jest.MockedFunction<
  typeof getIsStartMode
>;
const mockGetEditingExemplar =
  getAppOptionsEditingExemplar as jest.MockedFunction<
    typeof getAppOptionsEditingExemplar
  >;
const mockPut = HttpClient.put as jest.MockedFunction<typeof HttpClient.put>;
const mockPost = HttpClient.post as jest.MockedFunction<typeof HttpClient.post>;

const OPTIONS = {levelName: 'level 1', channelId: 'channel-1'};

describe('generateImageAssetUploadUrl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetIsStartMode.mockReturnValue(false);
    mockGetEditingExemplar.mockReturnValue(false);
  });

  it('targets the project channel with the file extension', () => {
    const file = new File(['x'], 'photo.png', {type: 'image/png'});
    expect(generateImageAssetUploadUrl(file, OPTIONS)).toBe(
      '/v3/assets/channel-1/uuid-1.png'
    );
  });

  it('falls back to the MIME type, then png, when the name has no extension', () => {
    const fromMime = new File(['x'], 'clipboard', {type: 'image/jpeg'});
    expect(generateImageAssetUploadUrl(fromMime, OPTIONS)).toBe(
      '/v3/assets/channel-1/uuid-1.jpg'
    );

    const noHints = new File(['x'], 'clipboard', {type: ''});
    expect(generateImageAssetUploadUrl(noHints, OPTIONS)).toBe(
      '/v3/assets/channel-1/uuid-1.png'
    );
  });

  it('targets the starter-asset path in start mode', () => {
    mockGetIsStartMode.mockReturnValue(true);
    const file = new File(['x'], 'photo.png', {type: 'image/png'});
    expect(generateImageAssetUploadUrl(file, OPTIONS)).toBe(
      '/level_starter_assets/level%201/uuid/uuid-1.png'
    );
  });
});

describe('uploadImageAsset', () => {
  const file = new File(['x'], 'photo.png', {type: 'image/png'});

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetIsStartMode.mockReturnValue(false);
    mockGetEditingExemplar.mockReturnValue(false);
  });

  it('PUTs to a freshly generated channel URL and returns it', async () => {
    const url = await uploadImageAsset(file, OPTIONS);

    expect(url).toBe('/v3/assets/channel-1/uuid-1.png');
    expect(mockPut).toHaveBeenCalledWith(url, file);
  });

  it('PUTs to the precomputed URL when one is provided', async () => {
    const precomputedUploadUrl = '/v3/assets/channel-1/precomputed.png';

    const url = await uploadImageAsset(file, {
      ...OPTIONS,
      precomputedUploadUrl,
    });

    expect(url).toBe(precomputedUploadUrl);
    expect(mockPut).toHaveBeenCalledWith(precomputedUploadUrl, file);
  });

  it('returns null without uploading when there is no channel', async () => {
    const url = await uploadImageAsset(file, {...OPTIONS, channelId: ''});

    expect(url).toBeNull();
    expect(mockPut).not.toHaveBeenCalled();
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('POSTs multipart form data to the starter-asset path in start mode', async () => {
    mockGetIsStartMode.mockReturnValue(true);

    const url = await uploadImageAsset(file, OPTIONS);

    expect(url).toBe('/level_starter_assets/level%201/uuid/uuid-1.png');
    expect(mockPost).toHaveBeenCalledWith(url, expect.any(FormData), true);
    expect(mockPut).not.toHaveBeenCalled();
  });
});
