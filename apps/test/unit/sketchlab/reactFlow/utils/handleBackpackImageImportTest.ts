import {makeBackpackImageImportHandler} from '@cdo/apps/sketchlab/reactFlow/utils/handleBackpackImageImport';
import {uploadImageAsset} from '@cdo/apps/sketchlab/reactFlow/utils/uploadImageAsset';

jest.mock('@cdo/apps/sketchlab/reactFlow/utils/uploadImageAsset');

const mockUploadImageAsset = uploadImageAsset as jest.MockedFunction<
  typeof uploadImageAsset
>;

describe('makeBackpackImageImportHandler', () => {
  const file = new File(['data'], 'my-sketch.png', {type: 'image/png'});
  let addImageNode: jest.Mock;
  let getFile: jest.Mock;
  let notifySuccess: jest.Mock;
  let notifyError: jest.Mock;

  function runImport() {
    const handler = makeBackpackImageImportHandler({
      levelName: 'level-1',
      channelId: 'channel-1',
      addImageNode,
    });
    return handler({
      fileName: 'my-sketch.png',
      getFile,
      notifySuccess,
      notifyError,
    });
  }

  beforeEach(() => {
    addImageNode = jest.fn();
    getFile = jest.fn().mockResolvedValue(file);
    notifySuccess = jest.fn();
    notifyError = jest.fn();
    mockUploadImageAsset.mockReset();
  });

  it('uploads the file as a project asset and adds an image node', async () => {
    mockUploadImageAsset.mockResolvedValue('/v3/assets/channel-1/abc.png');

    await runImport();

    expect(mockUploadImageAsset).toHaveBeenCalledWith(file, {
      levelName: 'level-1',
      channelId: 'channel-1',
    });
    // altText drops the file extension.
    expect(addImageNode).toHaveBeenCalledWith({
      src: '/v3/assets/channel-1/abc.png',
      altText: 'my-sketch',
    });
    expect(notifySuccess).toHaveBeenCalledWith('new', expect.any(String));
    expect(notifyError).not.toHaveBeenCalled();
  });

  it('reports an error and adds nothing when the upload cannot proceed', async () => {
    mockUploadImageAsset.mockResolvedValue(null);

    await runImport();

    expect(addImageNode).not.toHaveBeenCalled();
    expect(notifySuccess).not.toHaveBeenCalled();
    expect(notifyError).toHaveBeenCalledWith(expect.any(String));
  });

  it('reports an error when fetching the file throws', async () => {
    getFile.mockRejectedValue(new Error('network'));

    await runImport();

    expect(mockUploadImageAsset).not.toHaveBeenCalled();
    expect(addImageNode).not.toHaveBeenCalled();
    expect(notifyError).toHaveBeenCalledWith(expect.any(String));
  });
});
