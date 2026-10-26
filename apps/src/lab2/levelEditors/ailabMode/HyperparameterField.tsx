import TextField from '@code-dot-org/component-library/textField';
import React, {useState} from 'react';

import {
  getHyperparameter,
  getHyperparameterKey,
  isValidHyperparameter,
  ModeObject,
  setHyperparameter,
} from './ailabMode';

const LABELS: Record<string, string> = {
  k: 'Number of neighbors (k)',
  maxDepth: 'Maximum tree depth',
};

const isBlank = (text: string) => text.trim() === '';

interface HyperparameterFieldProps {
  mode: ModeObject;
  disabled: boolean;
  onChange: (mode: ModeObject) => void;
}

const HyperparameterField: React.FunctionComponent<
  HyperparameterFieldProps
> = ({mode, disabled, onChange}) => {
  const [text, setText] = useState(() => String(getHyperparameter(mode) ?? ''));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    const value = Number(newText);
    setText(newText);
    onChange(
      setHyperparameter(
        mode,
        !isBlank(newText) && isValidHyperparameter(value) ? value : undefined
      )
    );
  };
  const error =
    !isBlank(text) && !isValidHyperparameter(Number(text))
      ? 'Enter a whole number of at least 1.'
      : undefined;

  return (
    <TextField
      label={LABELS[getHyperparameterKey(mode)]}
      name="ailab_mode_hyperparameter"
      inputType="number"
      min={1}
      step={1}
      value={text}
      onChange={handleChange}
      disabled={disabled}
      helperMessage="The model is built with this value. Leave blank to try several and keep the most accurate."
      errorMessage={error}
      size="s"
    />
  );
};

export default HyperparameterField;
