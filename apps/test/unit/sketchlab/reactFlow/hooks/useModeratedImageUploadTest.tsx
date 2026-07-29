import {renderHook, act} from '@testing-library/react-hooks';

import {useFlaggedImage} from '@cdo/apps/lab2/hooks/useFlaggedImage';
import {unflagProjectChannel} from '@cdo/apps/lab2/redux/lab2ProjectReduxThunks';
import {useModeratedImageUpload} from '@cdo/apps/sketchlab/reactFlow/hooks/useModeratedImageUpload';
import {SketchLabNode} from '@cdo/apps/sketchlab/reactFlow/types';
import {
  generateImageAssetUploadUrl,
  isStarterAssetOrExemplarUpload,
  uploadImageAsset,
} from '@cdo/apps/sketchlab/reactFlow/utils/uploadImageAsset';
import HttpClient from '@cdo/apps/util/HttpClient';
import {moderateImage} from '@cdo/apps/util/moderateImage';

jest.mock('@cdo/apps/util/moderateImage', () => ({
  moderateImage: jest.fn(),
}));

jest.mock('@cdo/apps/util/HttpClient', () => ({
  delete: jest.fn(),
}));

jest.mock('@cdo/apps/lab2/redux/lab2ProjectReduxThunks', () => ({
  unflagProjectChannel: jest.fn(),
}));

jest.mock('@cdo/apps/lab2/Lab2Registry', () => ({
  getInstance: () => ({
    getMetricsReporter: () => ({logError: jest.fn()}),
  }),
}));

jest.mock('@cdo/apps/sketchlab/reactFlow/utils/uploadImageAsset', () => ({
  uploadImageAsset: jest.fn(),
  generateImageAssetUploadUrl: jest.fn(),
  isStarterAssetOrExemplarUpload: jest.fn(),
}));

// The flagged-image consent flow (modal state, abuse flagging) is
// useFlaggedImage's own responsibility; here we only assert the hook hands it
// the deferred upload.
const mockOnImageFlagged = jest.fn();
jest.mock('@cdo/apps/lab2/hooks/useFlaggedImage', () => ({
  useFlaggedImage: jest.fn(() => ({
    flaggedImageData: null,
    onImageFlagged: mockOnImageFlagged,
    handleAcceptFlaggedImage: jest.fn(),
    handleCancelFlaggedImage: jest.fn(),
  })),
}));

// The hook reads the channel and abuse state from redux; stub the selector so
// no store/Provider is needed. Reassigned per test via mockState.
let mockState: {
  lab?: {channel?: {id: string}; isBlockedAbuse?: boolean};
};
const mockDispatch = jest.fn();
jest.mock('@cdo/apps/util/reduxHooks', () => ({
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector(mockState),
  useAppDispatch: () => mockDispatch,
}));

const mockModerateImage = moderateImage as jest.MockedFunction<
  typeof moderateImage
>;
const mockUploadImageAsset = uploadImageAsset as jest.MockedFunction<
  typeof uploadImageAsset
>;
const mockGenerateUploadUrl =
  generateImageAssetUploadUrl as jest.MockedFunction<
    typeof generateImageAssetUploadUrl
  >;
const mockIsStarterAssetOrExemplar =
  isStarterAssetOrExemplarUpload as jest.MockedFunction<
    typeof isStarterAssetOrExemplarUpload
  >;
const mockUseFlaggedImage = useFlaggedImage as jest.MockedFunction<
  typeof useFlaggedImage
>;
const mockHttpDelete = HttpClient.delete as jest.MockedFunction<
  typeof HttpClient.delete
>;
const mockUnflagProjectChannel = unflagProjectChannel as jest.MockedFunction<
  typeof unflagProjectChannel
>;

const LEVEL_NAME = 'test-level';
const CHANNEL_ID = 'channel-1';
const UPLOAD_URL = '/v3/assets/channel-1/uuid.png';

describe('useModeratedImageUpload', () => {
  const file = new File(['data'], 'photo.png', {type: 'image/png'});
  let onUploaded: jest.Mock;
  let onError: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockState = {
      lab: {channel: {id: CHANNEL_ID}, isBlockedAbuse: false},
    };
    mockIsStarterAssetOrExemplar.mockReturnValue(false);
    mockGenerateUploadUrl.mockReturnValue(UPLOAD_URL);
    mockUploadImageAsset.mockResolvedValue(UPLOAD_URL);
    mockModerateImage.mockResolvedValue('safe');
    mockHttpDelete.mockResolvedValue({} as Response);
    onUploaded = jest.fn();
    onError = jest.fn();
  });

  function renderModeratedUpload() {
    return renderHook(() =>
      useModeratedImageUpload({levelName: LEVEL_NAME})
    );
  }

  async function upload(result: {
    current: ReturnType<typeof useModeratedImageUpload>;
  }) {
    await act(async () => {
      await result.current.uploadImage({file, onUploaded, onError});
    });
  }

  it('moderates then uploads a safe image to the precomputed URL', async () => {
    const {result} = renderModeratedUpload();

    await upload(result);

    expect(mockModerateImage).toHaveBeenCalledWith(file, 'sketchlab', {
      uploaderType: 'SketchLab',
      assetUrl: UPLOAD_URL,
    });
    expect(mockUploadImageAsset).toHaveBeenCalledWith(file, {
      levelName: LEVEL_NAME,
      channelId: CHANNEL_ID,
      precomputedUploadUrl: UPLOAD_URL,
    });
    expect(onUploaded).toHaveBeenCalledWith(UPLOAD_URL, false);
    expect(onError).not.toHaveBeenCalled();
  });

  it('uploads anyway when the moderation service errors (fail open)', async () => {
    mockModerateImage.mockResolvedValue('error');
    const {result} = renderModeratedUpload();

    await upload(result);

    expect(mockUploadImageAsset).toHaveBeenCalled();
    expect(onUploaded).toHaveBeenCalledWith(UPLOAD_URL, false);
  });

  it('defers a flagged upload to the consent flow', async () => {
    mockModerateImage.mockResolvedValue('flagged');
    const {result} = renderModeratedUpload();

    await upload(result);

    expect(mockUploadImageAsset).not.toHaveBeenCalled();
    expect(onUploaded).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
    expect(mockOnImageFlagged).toHaveBeenCalledWith(
      file,
      'png',
      expect.any(Function)
    );

    // Accepting in the modal runs the deferred upload at the same URL; the
    // node is marked flagged so deleting it later can lift the block.
    const deferredUpload = mockOnImageFlagged.mock.calls[0][2];
    await deferredUpload();
    expect(mockUploadImageAsset).toHaveBeenCalledWith(file, {
      levelName: LEVEL_NAME,
      channelId: CHANNEL_ID,
      precomputedUploadUrl: UPLOAD_URL,
    });
    expect(onUploaded).toHaveBeenCalledWith(UPLOAD_URL, true);
  });

  it('reports an error and rethrows when the deferred upload fails', async () => {
    mockModerateImage.mockResolvedValue('flagged');
    const {result} = renderModeratedUpload();

    await upload(result);

    mockUploadImageAsset.mockRejectedValue(new Error('network down'));
    const deferredUpload = mockOnImageFlagged.mock.calls[0][2];
    // Rethrowing lets useFlaggedImage skip flagging the channel.
    await expect(deferredUpload()).rejects.toThrow('network down');
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onUploaded).not.toHaveBeenCalled();
  });

  it('shows the uploads-disabled modal instead of uploading when blocked', async () => {
    mockState = {
      lab: {channel: {id: CHANNEL_ID}, isBlockedAbuse: true},
    };
    const {result} = renderModeratedUpload();

    await upload(result);

    expect(result.current.showUploadsDisabledModal).toBe(true);
    expect(mockModerateImage).not.toHaveBeenCalled();
    expect(mockUploadImageAsset).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();

    act(() => result.current.closeUploadsDisabledModal());
    expect(result.current.showUploadsDisabledModal).toBe(false);
  });

  it('skips moderation when the request says the image was already moderated', async () => {
    const {result} = renderModeratedUpload();

    await act(async () => {
      await result.current.uploadImage({
        file,
        skipModeration: true,
        onUploaded,
        onError,
      });
    });

    expect(mockModerateImage).not.toHaveBeenCalled();
    expect(onUploaded).toHaveBeenCalledWith(UPLOAD_URL, false);
  });

  it('still blocks skip-moderation uploads when the project is blocked', async () => {
    mockState = {
      lab: {channel: {id: CHANNEL_ID}, isBlockedAbuse: true},
    };
    const {result} = renderModeratedUpload();

    await act(async () => {
      await result.current.uploadImage({
        file,
        skipModeration: true,
        onUploaded,
        onError,
      });
    });

    expect(result.current.showUploadsDisabledModal).toBe(true);
    expect(mockUploadImageAsset).not.toHaveBeenCalled();
  });

  it('skips moderation for starter-asset and exemplar uploads', async () => {
    mockIsStarterAssetOrExemplar.mockReturnValue(true);
    const {result} = renderModeratedUpload();

    await upload(result);

    expect(mockModerateImage).not.toHaveBeenCalled();
    expect(mockUploadImageAsset).toHaveBeenCalledWith(file, {
      levelName: LEVEL_NAME,
      channelId: CHANNEL_ID,
    });
    expect(onUploaded).toHaveBeenCalledWith(UPLOAD_URL, false);
  });

  it('rejects file types the moderation service cannot check', async () => {
    const svgFile = new File(['<svg/>'], 'image.svg', {
      type: 'image/svg+xml',
    });
    const {result} = renderModeratedUpload();

    await act(async () => {
      await result.current.uploadImage({file: svgFile, onUploaded, onError});
    });

    expect(onError).toHaveBeenCalledTimes(1);
    expect(mockModerateImage).not.toHaveBeenCalled();
    expect(mockUploadImageAsset).not.toHaveBeenCalled();
  });

  it('reports an error when there is no project channel', async () => {
    mockState = {};
    const {result} = renderModeratedUpload();

    await upload(result);

    expect(onError).toHaveBeenCalledTimes(1);
    expect(mockModerateImage).not.toHaveBeenCalled();
    expect(mockUploadImageAsset).not.toHaveBeenCalled();
  });

  it('reports an error when the safe-path upload throws', async () => {
    mockUploadImageAsset.mockRejectedValue(new Error('network down'));
    const {result} = renderModeratedUpload();

    await upload(result);

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onUploaded).not.toHaveBeenCalled();
  });

  it('passes the SketchLab uploader type to the consent flow', () => {
    renderModeratedUpload();
    expect(mockUseFlaggedImage).toHaveBeenCalledWith('SketchLab');
  });

  describe('handleImageNodesDeleted', () => {
    const flaggedImageNode = {
      id: 'node-1',
      type: 'image',
      position: {x: 0, y: 0},
      data: {src: UPLOAD_URL, altText: 'photo', flagged: true},
    } as SketchLabNode;
    const safeImageNode = {
      id: 'node-2',
      type: 'image',
      position: {x: 0, y: 0},
      data: {src: '/v3/assets/channel-1/safe.png', altText: 'safe'},
    } as SketchLabNode;
    const textNode = {
      id: 'node-3',
      type: 'text',
      position: {x: 0, y: 0},
      data: {text: 'hello'},
    } as SketchLabNode;

    async function deleteNodes(nodes: SketchLabNode[]) {
      const {result} = renderModeratedUpload();
      await act(async () => {
        await result.current.handleImageNodesDeleted(nodes);
      });
    }

    it('hard-deletes a flagged image asset and unflags a blocked project', async () => {
      mockState = {lab: {channel: {id: CHANNEL_ID}, isBlockedAbuse: true}};

      await deleteNodes([flaggedImageNode, safeImageNode, textNode]);

      expect(mockHttpDelete).toHaveBeenCalledTimes(1);
      expect(mockHttpDelete).toHaveBeenCalledWith(UPLOAD_URL);
      expect(mockUnflagProjectChannel).toHaveBeenCalledWith(
        CHANNEL_ID,
        mockDispatch
      );
    });

    it('leaves unflagged image assets in storage', async () => {
      await deleteNodes([safeImageNode, textNode]);

      expect(mockHttpDelete).not.toHaveBeenCalled();
      expect(mockUnflagProjectChannel).not.toHaveBeenCalled();
    });

    it('deletes the asset but does not unflag when the project is not blocked', async () => {
      await deleteNodes([flaggedImageNode]);

      expect(mockHttpDelete).toHaveBeenCalledWith(UPLOAD_URL);
      expect(mockUnflagProjectChannel).not.toHaveBeenCalled();
    });

    it('does not unflag when the asset delete fails', async () => {
      mockState = {lab: {channel: {id: CHANNEL_ID}, isBlockedAbuse: true}};
      mockHttpDelete.mockRejectedValue(new Error('network down'));

      await deleteNodes([flaggedImageNode]);

      expect(mockUnflagProjectChannel).not.toHaveBeenCalled();
    });
  });
});
