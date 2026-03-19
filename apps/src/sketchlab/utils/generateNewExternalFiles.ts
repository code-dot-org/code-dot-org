import {extension as mimeToExtension} from 'mime-types';

import {
  getAppOptionsEditingExemplar,
  getIsStartMode,
} from '@cdo/apps/lab2/projects/utils';
import {
  SketchlabExternalFiles,
  ExcalidrawFilesWithOptionalData,
  SketchlabProjectFile,
} from '@cdo/apps/lab2/types';

export const generateNewExternalFiles = (
  newFileIds: string[],
  excalidrawFiles: ExcalidrawFilesWithOptionalData,
  levelName: string,
  channelId: string
) => {
  const newFiles: SketchlabExternalFiles = {};

  if (newFileIds.length && excalidrawFiles) {
    newFileIds.forEach(fileId => {
      const newFile = excalidrawFiles[fileId];
      const extension = mimeToExtension(newFile.mimeType);
      const filenameWithExtension = `${fileId}.${extension}`;
      const isStarterAssetOrExemplar = !!(
        getIsStartMode() || getAppOptionsEditingExemplar()
      );
      const externalUrl = isStarterAssetOrExemplar
        ? `/level_starter_assets/${encodeURIComponent(
            levelName
          )}/uuid/${filenameWithExtension}`
        : `/v3/assets/${channelId}/${filenameWithExtension}`;
      const newExternalFile: SketchlabProjectFile = {
        id: fileId,
        url: externalUrl,
        starterAsset: isStarterAssetOrExemplar,
        filenameWithExtension,
      };

      newFiles[fileId] = newExternalFile;
    });
  }

  return newFiles;
};
