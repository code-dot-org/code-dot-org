import {
  getAppOptionsEditingExemplar,
  getIsStartMode,
} from '@cdo/apps/lab2/projects/utils';
import {
  SketchlabExternalFiles,
  ExcalidrawFilesWithOptionalData,
  SketchlabProjectFile,
} from '@cdo/apps/lab2/types';

const MIME_TO_EXT = {
  'image/svg+xml': 'svg',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/bmp': 'bmp',
  'image/x-icon': 'ico',
  'image/avif': 'avif',
  'image/jfif': 'jfif',
  'application/octet-stream': 'bin',
};

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
      const extension = MIME_TO_EXT[newFile.mimeType];
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
