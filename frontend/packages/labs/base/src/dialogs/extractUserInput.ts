import type {DialogClosePromiseReturnType} from '../dialogs';

// given a promise returned from DialogControlProvider's showDialog({type : DialogType.GenericPrompt}), will return the input
// that was typed in by the user.
// Note that if the user did not press the `confirm` button, then an empty string will be returned instead.
export const extractUserInput = (
  promiseResults: DialogClosePromiseReturnType,
  includeNeutral?: boolean,
): string => {
  const {type, args} = promiseResults;
  if (type === 'confirm') {
    return args as string;
  }
  if (type === 'neutral' && includeNeutral) {
    return args as string;
  }

  return '';
};
