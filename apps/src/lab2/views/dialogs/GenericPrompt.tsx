import React, {useState, useCallback} from 'react';

import TextField from '@cdo/apps/componentLibrary/textField';

import GenericDialog, {GenericDialogProps} from './GenericDialog';

export type GenericPromptProps = Required<Pick<GenericDialogProps, 'title'>> & {
  handleConfirm: (prompt: string) => void;
  handleCancel?: () => void;
  placeholder?: string;
  validateInput: (prompt: string) => string | undefined;
};

/**
 * Generic Prompt dialog used in Lab2 labs.
 * The title, message, and confirm button text can be customized.
 * If no confirm button text is provided, the default text is "OK" (translatable).
 */

type GenericPromptBodyProps = {
  placeholder?: string;
  prompt: string;
  handlePromptChange: (newPrompt: string) => void;
  errorMessage?: string;
};

const GenericPromptBody: React.FunctionComponent<GenericPromptBodyProps> = ({
  placeholder,
  prompt,
  handlePromptChange,
  errorMessage,
}) => {
  return (
    <TextField
      name="prompt-field"
      placeholder={placeholder}
      value={prompt}
      onChange={e => handlePromptChange(e.target.value)}
      errorMessage={errorMessage}
    />
  );
};

const GenericPrompt: React.FunctionComponent<GenericPromptProps> = ({
  title,
  handleConfirm,
  placeholder,
  validateInput = () => undefined,
}) => {
  const [prompt, setPrompt] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );

  const handlePromptChange = useCallback(
    (newPrompt: string) => {
      setPrompt(newPrompt);
      setErrorMessage(validateInput(newPrompt));
    },
    [validateInput, setPrompt, setErrorMessage]
  );

  return (
    <GenericDialog
      title={title}
      bodyComponent={
        <GenericPromptBody
          placeholder={placeholder}
          prompt={prompt}
          handlePromptChange={handlePromptChange}
          errorMessage={errorMessage}
        />
      }
      buttons={{
        confirm: {
          callback: () => handleConfirm(prompt),
          disabled: Boolean(errorMessage) || !prompt.length,
        },
        cancel: {},
      }}
    />
  );
};

export default GenericPrompt;
