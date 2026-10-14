import Checkbox from '@code-dot-org/component-library/checkbox';
import {Typography} from '@mui/material';
import React, {useId, useRef} from 'react';

import {
  isMissingPretrainedColumns,
  ModeObject,
  restoreFromPretrained,
  setPretrained,
} from './ailabMode';
import {DatasetColumns} from './datasetColumns';
import {useCheckboxValidity} from './useCheckboxValidity';

import moduleStyles from './edit-ailab-mode.module.scss';

interface PretrainedFieldProps {
  mode: ModeObject;
  columns: DatasetColumns | undefined;
  onChange: (mode: ModeObject) => void;
}

const PretrainedField: React.FunctionComponent<PretrainedFieldProps> = ({
  mode,
  columns,
  onChange,
}) => {
  const error = isMissingPretrainedColumns(mode, columns?.selectable)
    ? 'Choose a label and features to train the model on.'
    : undefined;
  const checkboxRef = useCheckboxValidity(error);
  const errorId = useId();
  const beforePretrainedRef = useRef<ModeObject>();

  return (
    <div ref={checkboxRef}>
      <Checkbox
        name="ailab_mode_pretrained"
        label="Pretrain the model"
        checked={mode.pretrained === true}
        disabled={!columns}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        onChange={e => {
          if (e.target.checked) {
            beforePretrainedRef.current = mode;
            onChange(setPretrained(mode, true, columns?.defaultLabel));
          } else {
            onChange(restoreFromPretrained(mode, beforePretrainedRef.current));
          }
        }}
        size="s"
      />
      <Typography variant="body4" className={moduleStyles.descriptionText}>
        Students start with the model already trained on the label and features
        below. They cannot change these columns, train the model again, or start
        over. The model tests on the last rows, and the level cannot require an
        accuracy.
      </Typography>
      {error && (
        <Typography
          id={errorId}
          variant="body4"
          className={moduleStyles.warningText}
        >
          {error}
        </Typography>
      )}
    </div>
  );
};

export default PretrainedField;
