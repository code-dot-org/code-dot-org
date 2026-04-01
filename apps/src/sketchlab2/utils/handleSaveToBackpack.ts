import {type Editor} from 'tldraw';

import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import {
  DialogControlInterface,
  DialogType,
  extractUserInput,
} from '@cdo/apps/lab2/views/dialogs';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import BackpackClientApi from '@cdo/apps/sharedComponents/backpack/BackpackClientApi';

export const handleSaveToBackpack = async (
  editor: Editor | undefined | null,
  backpackApi: BackpackClientApi | undefined,
  dialogControl: DialogControlInterface,
  backpackFileList: string[],
  errorCallback: (error: string) => void
) => {
  if (!editor || !backpackApi) {
    return;
  }
  const validateSketchName = (
    sketchName: string
  ): {type: 'error' | 'warning'; text: string} | undefined => {
    if (sketchName.length === 0) {
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
  const newFileName = extractUserInput(dialogResults) + '.png';

  try {
    const shapeIds = editor.getCurrentPageShapeIds();
    if (shapeIds.size === 0) {
      errorCallback('No shapes to export.');
      return;
    }

    const result = await editor.toImage([...shapeIds], {
      format: 'png',
      padding: 50,
      pixelRatio: 2,
    });

    const eventName = backpackFileList.includes(newFileName)
      ? EVENTS.SAVE_TO_BACKPACK_REPLACE
      : EVENTS.SAVE_TO_BACKPACK_NEW;
    backpackApi.saveBlobFile(
      newFileName,
      result.blob,
      () => {
        errorCallback(
          `Error saving ${newFileName} to your Backpack. Please try again`
        );
      },
      () => {
        sendLab2AnalyticsEvent(eventName, {fileType: 'png'});
      }
    );
  } catch {
    errorCallback('Error exporting sketch as image. Please try again.');
  }
};
