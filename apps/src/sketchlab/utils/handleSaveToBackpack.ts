import {exportToBlob} from '@excalidraw/excalidraw';
import {ExcalidrawImperativeAPI} from '@excalidraw/excalidraw/types/types';

import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import {
  DialogControlInterface,
  DialogType,
  extractUserInput,
} from '@cdo/apps/lab2/views/dialogs';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import BackpackClientApi from '@cdo/apps/sharedComponents/backpack/BackpackClientApi';

export const handleSaveToBackpack = async (
  excalidrawApi: ExcalidrawImperativeAPI | undefined | null,
  backpackApi: BackpackClientApi | undefined,
  dialogControl: DialogControlInterface,
  backpackFileList: string[],
  errorCallback: (error: string) => void
) => {
  if (!excalidrawApi || !backpackApi) {
    return;
  }
  const validateSketchName = (
    sketchName: string
  ): {type: 'error' | 'warning'; text: string} | undefined => {
    if (sketchName.length === 0) {
      // The name is required by GenericPrompt, so the button will be disabled
      // and we don't want to provide an error message.
      return undefined;
    }
    const containsValidCharacters = /^[\w-]+$/.test(sketchName);
    if (!containsValidCharacters) {
      return {
        type: 'error',
        text: 'Sketch names can only contain letters, numbers, hyphens and underscores.',
      };
    }
    if (backpackFileList.includes(sketchName + '.png')) {
      return {
        type: 'warning',
        text: 'A file with this name already exists in your Backpack.',
      };
    }
  };
  const dialogResults = await dialogControl.showDialog({
    type: DialogType.GenericPrompt,
    title: 'Give your sketch a name',
    validateInput: validateSketchName,
    message: 'Save sketch as:',
    useModal: true,
    confirmButtonText: 'Save to Backpack',
    confirmButtonTextWithWarning: 'Replace existing file',
  });
  if (dialogResults.type !== 'confirm') {
    return;
  }
  // User has confirmed and file name is valid, start upload.
  const newFileName = extractUserInput(dialogResults) + '.png';
  const blobToSave = await exportToBlob({
    elements: excalidrawApi.getSceneElements(),
    appState: excalidrawApi.getAppState(),
    files: excalidrawApi.getFiles(),
    exportPadding: 10,
  });
  const eventName = backpackFileList.includes(newFileName)
    ? EVENTS.SAVE_TO_BACKPACK_REPLACE
    : EVENTS.SAVE_TO_BACKPACK_NEW;
  backpackApi.saveBlobFile(
    newFileName,
    blobToSave,
    () => {
      errorCallback(
        `Error saving ${newFileName} to your Backpack. Please try again`
      );
    },
    () => {
      // Backpack component handles success, just log to statsig.
      sendLab2AnalyticsEvent(eventName, {fileType: 'png'});
    }
  );
};
