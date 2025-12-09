import {
  getIsStartMode,
  getAppOptionsEditingExemplar,
} from '@cdo/apps/lab2/projects/utils';
import {
  SketchlabProjectFile,
  SketchlabExternalFiles,
  ExcalidrawFilesWithOptionalData,
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
  filesToUpload: SketchlabExternalFiles,
  excalidrawFiles: ExcalidrawFilesWithOptionalData,
  filesBeingUploadedRef: React.MutableRefObject<Set<string>>,
  onError: () => void
) => {
  for (const [fileId, fileContents] of Object.entries(filesToUpload)) {
    filesBeingUploadedRef.current.add(fileId);

    try {
      const excalidrawFile = excalidrawFiles[fileId];
      if (excalidrawFile) {
        const dataUrl = excalidrawFile.dataURL as string;
        const externalUrl = fileContents.url as string;
        await uploadBase64ToUrl(
          dataUrl,
          externalUrl,
          excalidrawFile.mimeType,
          !!fileContents?.starterAsset,
          fileContents?.filenameWithExtension || ''
        );
      }
    } catch {
      onError();
      console.error(`Error uploading file with id ${fileId}`);
    }

    filesBeingUploadedRef.current.delete(fileId);
  }
};
