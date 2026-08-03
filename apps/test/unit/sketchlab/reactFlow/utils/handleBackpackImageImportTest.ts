import {makeBackpackImageImportHandler} from '@cdo/apps/sketchlab/reactFlow/utils/handleBackpackImageImport';

describe('makeBackpackImageImportHandler', () => {
  const file = new File(['data'], 'my-sketch.png', {type: 'image/png'});
  let uploadImage: jest.Mock;
  let addImageNode: jest.Mock;
  let getFile: jest.Mock;
  let notifySuccess: jest.Mock;
  let notifyError: jest.Mock;

  function runImport() {
    const handler = makeBackpackImageImportHandler({
      uploadImage,
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
    // Successful upload: hand the asset URL to the continuation.
    uploadImage = jest.fn(async ({onUploaded}) =>
      onUploaded('/v3/assets/channel-1/abc.png', false)
    );
    addImageNode = jest.fn();
    getFile = jest.fn().mockResolvedValue(file);
    notifySuccess = jest.fn();
    notifyError = jest.fn();
  });

  it('uploads the file as a project asset and adds an image node', async () => {
    await runImport();

    // Backpack images were moderated when saved to the Backpack, so the
    // re-upload skips moderation.
    expect(uploadImage).toHaveBeenCalledWith(
      expect.objectContaining({file, skipModeration: true})
    );
    // altText drops the file extension.
    expect(addImageNode).toHaveBeenCalledWith({
      src: '/v3/assets/channel-1/abc.png',
      altText: 'my-sketch',
    });
    expect(notifySuccess).toHaveBeenCalledWith('new', expect.any(String));
    expect(notifyError).not.toHaveBeenCalled();
  });

  it('reports an error and adds nothing when the upload cannot proceed', async () => {
    uploadImage.mockImplementation(async ({onError}) => onError());

    await runImport();

    expect(addImageNode).not.toHaveBeenCalled();
    expect(notifySuccess).not.toHaveBeenCalled();
    expect(notifyError).toHaveBeenCalledWith(expect.any(String));
  });

  it('reports an error when fetching the file throws', async () => {
    getFile.mockRejectedValue(new Error('network'));

    await runImport();

    expect(uploadImage).not.toHaveBeenCalled();
    expect(addImageNode).not.toHaveBeenCalled();
    expect(notifyError).toHaveBeenCalledWith(expect.any(String));
  });
});
