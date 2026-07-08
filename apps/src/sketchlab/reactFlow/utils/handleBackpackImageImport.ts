import {AddFileHandler} from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/Backpack/types';

import {ImageNodeData} from '../types';

import {uploadImageAsset} from './uploadImageAsset';

interface BackpackImageImportOptions {
  levelName: string;
  channelId: string;
  addImageNode: (data: ImageNodeData) => void;
}

/**
 * Builds the Backpack panel's addFileHandler for Sketch Lab. Re-uploads the
 * chosen Backpack image as a project asset, then adds it to the canvas as an image node.
 */
export function makeBackpackImageImportHandler({
  levelName,
  channelId,
  addImageNode,
}: BackpackImageImportOptions): AddFileHandler {
  return async ({fileName, getFile, notifySuccess, notifyError}) => {
    try {
      const file = await getFile();
      const uploadUrl = await uploadImageAsset(file, {levelName, channelId});
      if (!uploadUrl) {
        notifyError(`Could not add ${fileName} to your sketch.`);
        return;
      }
      addImageNode({
        src: uploadUrl,
        altText: fileName.replace(/\.[^.]+$/, ''),
      });
      notifySuccess('new', `${fileName} added to your sketch!`);
    } catch {
      notifyError(`Could not add ${fileName} to your sketch.`);
    }
  };
}
