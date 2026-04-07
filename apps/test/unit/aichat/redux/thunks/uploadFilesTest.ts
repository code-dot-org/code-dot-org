import {sendAnalytics} from '@cdo/apps/aichat/redux/thunks/sendAnalytics';
import {uploadFiles} from '@cdo/apps/aichat/redux/thunks/uploadFiles';
import {AssetSource, ChatAsset} from '@cdo/apps/aichat/types';
import {RootState} from '@cdo/apps/types/redux';
import HttpClient from '@cdo/apps/util/HttpClient';
import {moderateImage} from '@cdo/apps/util/moderateImage';

jest.mock('@cdo/apps/util/HttpClient');
jest.mock('@cdo/apps/util/moderateImage', () => ({
  moderateImage: jest.fn(),
}));
jest.mock('@cdo/apps/aichat/redux/thunks/sendAnalytics', () => ({
  sendAnalytics: jest.fn(),
}));
jest.mock('@cdo/apps/lab2/Lab2Registry', () => ({
  default: {
    getInstance: () => ({
      getMetricsReporter: () => ({logError: jest.fn()}),
    }),
  },
}));

const mockHttpClient = HttpClient as jest.Mocked<typeof HttpClient>;
const mockModerateImage = moderateImage as jest.Mock;
const mockSendAnalytics = sendAnalytics as jest.Mock;

const makeFile = (name: string, type = 'image/png', size = 100): File =>
  Object.defineProperty(new File(['x'.repeat(size)], name, {type}), 'size', {
    value: size,
  });

const buildAssetUrl = (asset: ChatAsset) => `/files/${asset.filename}`;

const makeGetState = (numStagedFiles = 0) =>
  (() => ({
    aichat: {stagedFiles: Array(numStagedFiles).fill(null)},
  })) as unknown as () => RootState;

describe('uploadFiles', () => {
  let dispatch: jest.Mock;

  beforeEach(() => {
    dispatch = jest.fn();
    mockHttpClient.put.mockResolvedValue({} as Response);
    mockModerateImage.mockResolvedValue('ok');
    mockSendAnalytics.mockReturnValue(jest.fn());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('image moderation', () => {
    it('does not call HttpClient.put for a flagged image', async () => {
      mockModerateImage.mockResolvedValue('flagged');
      const file = makeFile('photo.png');

      await uploadFiles({files: [file], buildAssetUrl})(
        dispatch,
        makeGetState(),
        undefined
      );

      expect(mockHttpClient.put).not.toHaveBeenCalled();
    });

    it('dispatches stagedFileUploadFinished with imageFileFlagged for a flagged image', async () => {
      mockModerateImage.mockResolvedValue('flagged');
      const file = makeFile('photo.png');

      await uploadFiles({files: [file], buildAssetUrl})(
        dispatch,
        makeGetState(),
        undefined
      );

      const calls = dispatch.mock.calls.map(([action]) => action);
      expect(calls).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            payload: expect.objectContaining({status: 'imageFileFlagged'}),
          }),
        ])
      );
    });

    it('still uploads non-flagged files when one file is flagged', async () => {
      mockModerateImage
        .mockResolvedValueOnce('flagged')
        .mockResolvedValueOnce('ok');
      const flaggedFile = makeFile('bad.png');
      const cleanFile = makeFile('good.png');

      await uploadFiles({files: [flaggedFile, cleanFile], buildAssetUrl})(
        dispatch,
        makeGetState(),
        undefined
      );

      expect(mockHttpClient.put).toHaveBeenCalledTimes(1);
      expect(mockHttpClient.put).toHaveBeenCalledWith(
        buildAssetUrl({filename: 'good.png', source: AssetSource.PROJECT}),
        cleanFile
      );
    });

    it('skips moderation for PDF files', async () => {
      const pdfFile = makeFile('doc.pdf', 'application/pdf');

      await uploadFiles({files: [pdfFile], buildAssetUrl})(
        dispatch,
        makeGetState(),
        undefined
      );

      expect(mockModerateImage).not.toHaveBeenCalled();
      expect(mockHttpClient.put).toHaveBeenCalledTimes(1);
    });

    it('uploads the image when moderation returns ok', async () => {
      mockModerateImage.mockResolvedValue('ok');
      const file = makeFile('photo.png');

      await uploadFiles({files: [file], buildAssetUrl})(
        dispatch,
        makeGetState(),
        undefined
      );

      expect(mockHttpClient.put).toHaveBeenCalledTimes(1);
    });

    it('uploads the image when moderation is skipped', async () => {
      mockModerateImage.mockResolvedValue('skipped');
      const file = makeFile('photo.png');

      await uploadFiles({files: [file], buildAssetUrl})(
        dispatch,
        makeGetState(),
        undefined
      );

      expect(mockHttpClient.put).toHaveBeenCalledTimes(1);
    });
  });
});
