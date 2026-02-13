import {ExcalidrawElement} from '@excalidraw/excalidraw/types/element/types';
import {
  ExcalidrawInitialDataState,
  DataURL,
} from '@excalidraw/excalidraw/types/types';

import {ExcalidrawSourceWithExternalFiles} from '@cdo/apps/lab2/types';

import {imageUrlToBase64} from './imageUrlToBase64';

export const populateInitialExcalidrawState = async (
  sourcesWithExternalFiles: ExcalidrawSourceWithExternalFiles,
  downloadedFileData: Record<ExcalidrawElement['id'], DataURL>,
  onError: (error: Error) => void
) => {
  if (sourcesWithExternalFiles.files) {
    const imageDownloadPromises = Object.values(
      sourcesWithExternalFiles.files
    ).map(async file => {
      if (!Object.keys(downloadedFileData).includes(file.id)) {
        const fileUrl = sourcesWithExternalFiles.externalFiles?.[file.id].url;
        if (fileUrl) {
          // While we're still storing base64 encodings of strings in parallel with S3 uploads,
          // delete these so that we can confirm that the load from S3 is working.
          delete file.dataURL;

          try {
            const base64 = (await imageUrlToBase64(fileUrl)) as DataURL;
            file.dataURL = base64 as DataURL;
            downloadedFileData[file.id] = base64;
          } catch (error) {
            // Excalidraw handles files it can't load pretty well (ie, shows a placeholder image),
            // so proceed if we fail to encode an image for now and just track the error via this
            // upcall.
            if (error instanceof Error) {
              onError(
                new Error(`Cannot load image '${file.id}' from sources.`)
              );
            }
          }
        }
      } else {
        const base64 = downloadedFileData[file.id];
        file.dataURL = base64;
      }
    });
    await Promise.allSettled(imageDownloadPromises);
  }

  // Excalidraw does not need to access externalFiles, so we remove it
  // before passing this initial state to Excalidraw.
  delete sourcesWithExternalFiles.externalFiles;
  return sourcesWithExternalFiles as ExcalidrawInitialDataState;
};
