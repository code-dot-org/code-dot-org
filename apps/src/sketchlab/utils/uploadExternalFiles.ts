import {
  SketchlabProjectFile,
  ExcalidrawSourceWithExternalFiles,
} from '@cdo/apps/lab2/types';

import {SketchlabSources, SerializedExcalidrawState} from '../types';

import uploadBase64ToUrl from './uploadBase64ToUrl';

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

const uploadExternalFiles = (
  source: ExcalidrawSourceWithExternalFiles,
  serializedData: SerializedExcalidrawState,
  filesBeingUploadedRef: React.MutableRefObject<Set<string>>,
  channelId: string,
  updateSources: (newSources: SketchlabSources, forceSave?: boolean) => void
) => {
  const savedFileIds = Object.keys(source.externalFiles || {});
  const excalidrawFileIds = Object.keys(serializedData.files || {});
  const difference = excalidrawFileIds.filter(
    id => !savedFileIds.includes(id) && !filesBeingUploadedRef.current.has(id)
  );

  if (difference.length && serializedData.files) {
    difference.map(async fileId => {
      filesBeingUploadedRef.current.add(fileId);

      const newFile = serializedData.files[fileId];
      const extension = MIME_TO_EXT[newFile.mimeType];
      const externalUrl = `/v3/assets/${channelId}/${fileId}.${extension}`;
      const newExternalFile: SketchlabProjectFile = {
        id: fileId,
        url: externalUrl,
      };

      try {
        await uploadBase64ToUrl(newFile.dataURL, externalUrl, newFile.mimeType);
      } catch {
        // If an upload fails, still add an entry to externalFiles
        // so we don't reattempt the upload repeatedly.
        // Longer term work to handle failed uploads tracked here:
        // https://codedotorg.atlassian.net/browse/AFL-345
        newExternalFile.uploadFailed = true;
      }

      updateSources({
        source: {
          ...source,
          externalFiles: {
            ...source.externalFiles,
            [fileId]: newExternalFile,
          },
        },
      });
      filesBeingUploadedRef.current.delete(fileId);
    });
  }
};

export default uploadExternalFiles;
