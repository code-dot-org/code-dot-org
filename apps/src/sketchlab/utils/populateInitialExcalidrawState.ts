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
  downloadedFileData: Record<ExcalidrawElement['id'], DataURL>
) => {
  const excalidrawInitialState = cloneDeep(sourcesWithExternalFiles);

  if (excalidrawInitialState.files) {
    const imageDownloadPromises = Object.values(
      excalidrawInitialState.files
    ).map(async file => {
      if (!Object.keys(downloadedFileData).includes(file.id)) {
        const fileUrl = excalidrawInitialState.externalFiles?.[file.id].url;
        if (fileUrl) {
          try {
            const base64 = (await imageUrlToBase64(fileUrl)) as DataURL;
            file.dataURL = base64 as DataURL;
            downloadedFileData[file.id] = base64;
          } catch (error) {
            // Excalidraw handles files it can't load pretty well (ie, shows a placeholder image),
            // so proceed if we fail to encode an image for now.
            // Error handling investigation tracked here:
            // https://codedotorg.atlassian.net/browse/AFL-345
            console.error(error);
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
