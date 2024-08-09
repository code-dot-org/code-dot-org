import React, {useState} from 'react';

import TextField from '@cdo/apps/componentLibrary/textField';

import GenericDialog, {GenericDialogProps} from './GenericDialog';

export type GenericPromptProps = Required<Pick<GenericDialogProps, 'title'>> & {
  handleConfirm: (prompt: string) => void;
  handleCancel?: () => void;
  placeholder?: string;
};

/**
 * Generic Prompt dialog used in Lab2 labs.
 * The title, message, and confirm button text can be customized.
 * If no confirm button text is provided, the default text is "OK" (translatable).
 */

type GenericPromptBodyProps = {
  placeholder?: string;
  prompt: string;
  setPrompt: (newPrompt: string) => void;
};

const GenericPromptBody: React.FunctionComponent<GenericPromptBodyProps> = ({
  placeholder,
  prompt,
  setPrompt,
}) => {
  return (
    <TextField
      name="prompt-field"
      placeholder={placeholder}
      value={prompt}
      onChange={e => setPrompt(e.target.value)}
    />
  );
};

const GenericPrompt: React.FunctionComponent<GenericPromptProps> = ({
  title,
  handleConfirm,
  placeholder,
}) => {
  const [prompt, setPrompt] = useState('');
  return (
    <GenericDialog
      title={title}
      bodyComponent={
        <GenericPromptBody
          placeholder={placeholder}
          prompt={prompt}
          setPrompt={setPrompt}
        />
      }
      buttons={{
        confirm: {
          callback: () => handleConfirm(prompt),
        },
        cancel: {},
      }}
    />
  );
};

export default GenericPrompt;
