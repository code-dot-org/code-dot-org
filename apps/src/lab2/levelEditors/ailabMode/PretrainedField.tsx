import Checkbox from '@code-dot-org/component-library/checkbox';
import {Typography} from '@mui/material';
import React, {useEffect, useRef} from 'react';

import {
  isMissingPretrainedColumns,
  ModeObject,
  setPretrained,
} from './ailabMode';

import moduleStyles from './edit-ailab-mode.module.scss';

interface PretrainedFieldProps {
  mode: ModeObject;
  onChange: (mode: ModeObject) => void;
}

const PretrainedField: React.FunctionComponent<PretrainedFieldProps> = ({
  mode,
  onChange,
}) => {
  const checkboxRef = useRef<HTMLDivElement>(null);
  const error = isMissingPretrainedColumns(mode)
    ? 'Choose a label and features to train the model on.'
    : undefined;

  // Checkbox does not forward refs; missing columns stop the level from saving.
  useEffect(() => {
    checkboxRef.current!.querySelector('input')!.setCustomValidity(error ?? '');
  }, [error]);

  return (
    <div ref={checkboxRef}>
      <Checkbox
        name="ailab_mode_pretrained"
        label="Pretrain the model"
        checked={mode.pretrained === true}
        onChange={e => onChange(setPretrained(mode, e.target.checked))}
        size="s"
      />
      <Typography variant="body4" className={moduleStyles.descriptionText}>
        Students start with the model already trained on the label and features
        above, and cannot change them. The model tests on the last rows, and the
        level cannot require an accuracy.
      </Typography>
      {error && (
        <Typography variant="body4" className={moduleStyles.warningText}>
          {error}
        </Typography>
      )}
    </div>
  );
};

export default PretrainedField;
