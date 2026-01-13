import {ExcalidrawImperativeAPI} from '@excalidraw/excalidraw/types/types';

import {DialogControlInterface, DialogType} from '@cdo/apps/lab2/views/dialogs';
import BackpackClientApi from '@cdo/apps/sharedComponents/backpack/BackpackClientApi';

export const handleSaveToBackpack = async (
  excalidrawApi: ExcalidrawImperativeAPI | undefined | null,
  backpackApi: BackpackClientApi | null,
  dialogControl: DialogControlInterface,
  backpackFileList: string[]
) => {
  const validateSketchName = (sketchName: string) => {
    if (backpackFileList.includes(sketchName)) {
      return 'A file with this name already exists in your Backpack.';
    }
    return undefined;
  };
  const dialogResults = await dialogControl.showDialog({
    type: DialogType.GenericPrompt,
    title: 'Give your sketch a name',
    validateInput: validateSketchName,
    message: 'Save sketch as:',
    useModal: true,
    confirmButtonText: 'Save to Backpack',
    confirmButtonTextWithError: 'Replace existing file',
    allowConfirmOnValidationError: true,
  });
  if (dialogResults.type !== 'confirm') {
    return;
  }
  // User has confirmed and file name is valid, start upload.
  console.log('confirmed!');
};
