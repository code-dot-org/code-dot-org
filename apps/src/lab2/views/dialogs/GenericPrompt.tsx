import debounce from 'lodash/debounce';
import React, {useCallback, useEffect, useMemo, useState} from 'react';

import TextField from '@cdo/apps/componentLibrary/textField';
import {BodyTwoText} from '@cdo/apps/componentLibrary/typography';

import {useDialogControl} from './DialogControlContext';
import GenericDialog, {
  defaultGetButtonCallback,
  GenericDialogProps,
  GetButtonCallbackArgs,
} from './GenericDialog';

const DEBOUNCE_TIME_OUT = 300;

export type GenericPromptProps = Pick<GenericDialogProps, 'title'> & {
  handleConfirm?: (prompt: string) => void;
  handleCancel?: () => void;
  placeholder?: string;
  value?: string;
  validateInput?: (prompt: string) => string | undefined;
  requiresPrompt?: boolean;
  message?: string;
};

/**
 * Generic Prompt dialog used in Lab2 labs.
 * The title, message, and confirm button text can be customized.
 * If no confirm button text is provided, the default text is "OK" (translatable).
 */

type GenericPromptBodyProps = {
  message?: string;
  placeholder?: string;
  prompt: string;
  handleInputChange: (newInput: string) => void;
  errorMessage?: string;
};

const GenericPromptBody: React.FunctionComponent<GenericPromptBodyProps> = ({
  message,
  placeholder,
  prompt,
  handleInputChange,
  errorMessage,
}) => {
  return (
    <>
      {message && <BodyTwoText>{message}</BodyTwoText>}
      <TextField
        name="prompt-field"
        placeholder={placeholder}
        value={prompt}
        onChange={e => handleInputChange(e.target.value)}
        errorMessage={errorMessage}
      />
    </>
  );
};

const GenericPrompt: React.FunctionComponent<GenericPromptProps> = ({
  title,
  message,
  handleConfirm,
  handleCancel,
  placeholder,
  value,
  validateInput = () => undefined,
  requiresPrompt = true,
}) => {
  const {promiseArgs, setPromiseArgs} = useDialogControl();
  const prompt = (promiseArgs ?? (value || '')) as string;
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );

  const debouncedErrorHandler = useMemo(() => {
    return debounce((newInput: string) => {
      setErrorMessage(validateInput(newInput));
    }, DEBOUNCE_TIME_OUT);
  }, [setErrorMessage, validateInput]);

  const handleInputChange = useCallback(
    (newInput: string) => {
      setPromiseArgs(newInput);
      if (newInput.length && !errorMessage?.length) {
        debouncedErrorHandler(newInput);
      } else {
        setErrorMessage(validateInput(newInput));
      }
    },
    [
      errorMessage,
      validateInput,
      setPromiseArgs,
      setErrorMessage,
      debouncedErrorHandler,
    ]
  );

  // fire the handleInputChange callback once upon loading. This'll populate the given prompt into the promiseArgs
  // as well as calling validateInput on it to confirm it's acceptable.'
  useEffect(() => handleInputChange(prompt), []); // eslint-disable-line react-hooks/exhaustive-deps

  // we're going to hande in a custom buttonCallback getter to the generic dialog. We don't need to worry about memoizing this,
  // since it'll get memoized up in the parent component. When the user clicks the confirm button, we're just going to re-validate
  // the prompt. If if produces a validation error, display it and bow out. Otherwise, just proceed with the default handler.
  //
  // This will prevent the user from rapidly typing an invalid input and then clicking `OK` before the debounced error handler has
  // had a chance to catch up.
  const getButtonCallback =
    ({closeDialog, closeType, callback, disabled}: GetButtonCallbackArgs) =>
    () => {
      if (closeType === 'confirm') {
        const validationError = validateInput(prompt);
        if (validationError) {
          setErrorMessage(validationError);
          return;
        }
      }
      const defaultCallback = defaultGetButtonCallback({
        closeDialog,
        closeType,
        callback,
        disabled,
      });

      return defaultCallback();
    };

  return (
    <GenericDialog
      title={title}
      bodyComponent={
        <GenericPromptBody
          message={message}
          placeholder={placeholder}
          prompt={prompt}
          handleInputChange={handleInputChange}
          errorMessage={errorMessage}
        />
      }
      buttons={{
        confirm: {
          callback: () => handleConfirm?.(prompt),
          disabled: Boolean(errorMessage) || (requiresPrompt && !prompt.length),
        },
        cancel: {callback: () => handleCancel?.()},
      }}
      getButtonCallback={getButtonCallback}
    />
  );
};

export default GenericPrompt;
