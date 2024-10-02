import React, {useState, useCallback} from 'react';

import TextField from '@cdo/apps/componentLibrary/textField';
import {BodyTwoText} from '@cdo/apps/componentLibrary/typography';

import {useDialogControl} from './DialogControlContext';
import GenericDialog, {GenericDialogProps} from './GenericDialog';

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

  const handleInputChange = useCallback(
    (newInput: string) => {
      setPromiseArgs(newInput);
      setErrorMessage(validateInput(newInput));
    },
    [validateInput, setPromiseArgs, setErrorMessage]
  );

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
          disabled:
            requiresPrompt !== false &&
            (Boolean(errorMessage) || !prompt.length),
        },
        cancel: {callback: () => handleCancel?.()},
      }}
    />
  );
};

export default GenericPrompt;
