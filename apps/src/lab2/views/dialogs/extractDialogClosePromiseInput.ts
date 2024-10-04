import {DialogClosePromiseReturnType} from '@cdo/apps/lab2/views/dialogs';

// given a promise returned from DialogManager.showDialog({type : DialogType.GenericPrompt}), will return the input
// that was typed in by the user.
// Note that if the user did not press the `confirm` button, then an empty string will be returned instead.
export const extractDialogClosePromiseInput = (
  promiseResults: DialogClosePromiseReturnType
): string => {
  const {type, args} = promiseResults;
  if (type === 'confirm') {
    return args as string;
  }

  return '';
};
