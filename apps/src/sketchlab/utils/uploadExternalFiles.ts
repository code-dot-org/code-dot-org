import {BinaryFiles} from '@excalidraw/excalidraw/types/types';

import {
  SketchlabProjectFile,
  SketchlabExternalFiles,
} from '@cdo/apps/lab2/types';

import {uploadBase64ToUrl} from './uploadBase64ToUrl';

// TO DO: these are the upload types officially supported by Excalidraw,
// not all of which we actually support uploading to S3.
// Tracking error handling work here:
// https://codedotorg.atlassian.net/browse/AFL-345
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

export const uploadExternalFiles = async (
  savedFiles: SketchlabExternalFiles,
  excalidrawFiles: BinaryFiles,
  filesBeingUploadedRef: React.MutableRefObject<Set<string>>,
  channelId: string
) => {
  const savedFileIds = Object.keys(savedFiles || {});
  const excalidrawFileIds = Object.keys(excalidrawFiles || {});
  const newFileIds = excalidrawFileIds.filter(
    id => !savedFileIds.includes(id) && !filesBeingUploadedRef.current.has(id)
  );

  const uploadedFiles: SketchlabExternalFiles = {};
  if (newFileIds.length && excalidrawFiles) {
    const fileUploadPromises = newFileIds.map(async fileId => {
      filesBeingUploadedRef.current.add(fileId);

      // TO DO: update to support starter assets.
      // Work tracked here: https://codedotorg.atlassian.net/browse/AFL-354
      const newFile = excalidrawFiles[fileId];
      const extension = MIME_TO_EXT[newFile.mimeType];
      const externalUrl = `/v3/assets/${channelId}/${fileId}.${extension}`;
      const newExternalFile: SketchlabProjectFile = {
        id: fileId,
      };

      try {
        await uploadBase64ToUrl(newFile.dataURL, externalUrl, newFile.mimeType);
        newExternalFile.url = externalUrl;
      } catch {
        // If an upload fails, still add an entry to externalFiles
        // so we don't reattempt the upload repeatedly.
        // Longer term work to handle failed uploads tracked here:
        // https://codedotorg.atlassian.net/browse/AFL-345
        newExternalFile.uploadFailed = true;
      }

      uploadedFiles[fileId] = newExternalFile;
      filesBeingUploadedRef.current.delete(fileId);
    });

    await Promise.allSettled(fileUploadPromises);
  }

  return uploadedFiles;
};
