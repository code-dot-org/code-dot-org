import {ExcalidrawElement} from '@excalidraw/excalidraw/types/element/types';
import {
  ExcalidrawInitialDataState,
  DataURL,
} from '@excalidraw/excalidraw/types/types';
import cloneDeep from 'lodash/cloneDeep';

import {ExcalidrawSourceWithExternalFiles} from '@cdo/apps/lab2/types';

import {imageUrlToBase64} from './imageUrlToBase64';

export const populateInitialExcalidrawState = async (
  sourcesWithExternalFiles: ExcalidrawSourceWithExternalFiles,
  downloadedFileData: Record<ExcalidrawElement['id'], DataURL>,
  onError: (error: Error) => void
) => {
  const excalidrawInitialState = cloneDeep(sourcesWithExternalFiles);

  if (excalidrawInitialState.files) {
    const imageDownloadPromises = Object.values(
      excalidrawInitialState.files
    ).map(async file => {
      if (!Object.keys(downloadedFileData).includes(file.id)) {
        const externalFile = excalidrawInitialState.externalFiles?.[file.id];
        const fileUrl = externalFile?.url;
        const successfullyUploaded = externalFile?.uploaded;
        if (fileUrl && successfullyUploaded) {
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
  delete excalidrawInitialState.externalFiles;
  return excalidrawInitialState as ExcalidrawInitialDataState;
};
