import {useCallback} from 'react';

import {useDialogControl} from '@code-dot-org/lab/contexts';
import {DialogType} from '@code-dot-org/lab/dialogs';

interface NamePromptOptions {
  title: string;
  value?: string;
  placeholder?: string;
  validateInput?: (value: string) => string | undefined;
}

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
}

/**
 * Thin wrappers over the base dialog system for the name/confirm flows the file
 * browser needs. `showDialog` resolves with `{type, args}` where `args` is the
 * text the user typed (carried on the dialog's `promiseArgs`).
 *
 * The base `DialogControlProvider` is supplied by the `<Lab>` host, so these are
 * usable anywhere inside a mounted lab. Without a provider (e.g. an isolated
 * unit test) `showDialog` resolves to a cancel, so prompts simply no-op.
 */
export const usePrompts = () => {
  const dialogControl = useDialogControl();

  const promptForName = useCallback(
    async (options: NamePromptOptions): Promise<string | undefined> => {
      const result = await dialogControl.showDialog({
        type: DialogType.GenericPrompt,
        title: options.title,
        value: options.value,
        placeholder: options.placeholder,
        validateInput: options.validateInput,
      });
      if (result.type !== 'confirm') {
        return undefined;
      }
      const name = String(result.args ?? '').trim();
      return name || undefined;
    },
    [dialogControl],
  );

  const confirm = useCallback(
    async (options: ConfirmOptions): Promise<boolean> => {
      const result = await dialogControl.showDialog({
        type: DialogType.GenericConfirmation,
        title: options.title,
        message: options.message,
        confirmText: options.confirmText,
      });
      return result.type === 'confirm';
    },
    [dialogControl],
  );

  const alert = useCallback(
    async (options: {title: string; message?: string}): Promise<void> => {
      await dialogControl.showDialog({
        type: DialogType.GenericAlert,
        title: options.title,
        message: options.message,
      });
    },
    [dialogControl],
  );

  return {promptForName, confirm, alert};
};
