import {
  SketchlabExternalFiles,
  ExcalidrawFilesWithOptionalData,
} from '@cdo/apps/lab2/types';

import {uploadBase64ToUrl} from './uploadBase64ToUrl';

export const uploadExternalFiles = async (
  filesToUpload: SketchlabExternalFiles,
  excalidrawFiles: ExcalidrawFilesWithOptionalData,
  filesBeingUploadedRef: React.MutableRefObject<Set<string>>
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
      // https://codedotorg.atlassian.net/browse/AFL-345
      console.error(`Error uploading file with id ${fileId}`);
    }

    filesBeingUploadedRef.current.delete(fileId);
  }
};
