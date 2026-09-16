import {AddFileHandler} from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/Backpack/types';

import {ModeratedImageUploader} from '../hooks/useModeratedImageUpload';
import {ImageNodeData} from '../types';

interface BackpackImageImportOptions {
  uploadImage: ModeratedImageUploader;
  addImageNode: (data: ImageNodeData) => void;
}

/**
 * Builds the Backpack panel's addFileHandler for Sketch Lab. Re-uploads the
 * chosen Backpack image as a project asset, then adds it to the canvas as an
 * image node. Backpack images were already moderated when they were saved to
 * the Backpack, so the re-upload skips moderation.
 */
export function makeBackpackImageImportHandler({
  uploadImage,
  addImageNode,
}: BackpackImageImportOptions): AddFileHandler {
  return async ({fileName, getFile, notifySuccess, notifyError}) => {
    const onError = () =>
      notifyError(`Could not add ${fileName} to your sketch.`);
    try {
      const file = await getFile();
      await uploadImage({
        file,
        skipModeration: true,
        onUploaded: uploadUrl => {
          addImageNode({
            src: uploadUrl,
            altText: fileName.replace(/\.[^.]+$/, ''),
          });
          notifySuccess('new', `${fileName} added to your sketch!`);
        },
        onError,
      });
    } catch {
      onError();
    }
  };
}
