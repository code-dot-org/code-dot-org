import Checkbox from '@code-dot-org/component-library/checkbox';
import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import TextField from '@code-dot-org/component-library/textField';
import {Typography} from '@mui/material';
import React, {useState} from 'react';

import {setJsonObjectValue} from '../jsonUtils';

import {
  BooleanModeKey,
  DEFAULT_TRAINER,
  getSelectedDataset,
  isValidAccuracy,
  MAX_ACCURACY,
  MIN_ACCURACY,
  ModeObject,
  setDataset,
  setLabel,
} from './ailabMode';
import {DatasetFiles, useDatasetColumns} from './datasetColumns';

import moduleStyles from './edit-ailab-mode.module.scss';

export interface AilabDataset extends DatasetFiles {
  name: string;
  isToy?: boolean;
}

interface AilabModeFieldsProps {
  mode: ModeObject;
  datasets: AilabDataset[];
  // Saved values that were not valid and are dropped from the mode.
  removed: string[];
  onChange: (mode: ModeObject) => void;
}

const BOOLEAN_FIELDS: {key: BooleanModeKey; label: string}[] = [
  {key: 'hideSave', label: 'Hide the save model step'},
  {
    key: 'hideColumnClicking',
    label: 'Disable clicking and highlighting columns in the data table',
  },
  {
    key: 'randomizeTestData',
    label: 'Reserve random rows for testing instead of the last rows',
  },
];

const NO_DATASET = '';
const NO_LABEL = '';

const TRAINER_ITEMS = [
  {value: 'knn', text: 'k-nearest neighbors'},
  {value: 'decisionTree', text: 'Decision tree'},
];

const AilabModeFields: React.FunctionComponent<AilabModeFieldsProps> = ({
  mode,
  datasets,
  removed,
  onChange,
}) => {
  const [accuracyText, setAccuracyText] = useState(() =>
    isValidAccuracy(mode.requireAccuracy) ? String(mode.requireAccuracy) : ''
  );

  const selectedDataset = getSelectedDataset(mode);
  const {columns, failed: columnsFailed} = useDatasetColumns(
    datasets.find(dataset => dataset.id === selectedDataset)
  );

  // A flat list, because a required select only treats a top-level empty option as unchosen.
  const datasetItems = [
    ...(selectedDataset
      ? []
      : [{value: NO_DATASET, text: 'Choose a dataset', disabled: true}]),
    ...[
      ...datasets.filter(dataset => !dataset.isToy),
      ...datasets.filter(dataset => dataset.isToy),
    ].map(dataset => ({
      value: dataset.id,
      text: `${dataset.name} (${dataset.id})`,
    })),
  ];

  const selectedTrainer =
    (mode.trainer as string | undefined) ?? DEFAULT_TRAINER;

  const label = mode.label as string | undefined;
  const labelLocked = mode.hideSelectLabel === true;
  const defaultLabel = columns?.defaultLabel;
  const noneMeansDefault = labelLocked && !!defaultLabel;
  const startingLabel = label ?? (labelLocked ? defaultLabel : undefined);
  const selectableColumns = columns?.selectable ?? [];
  const unlistedLabel =
    label !== undefined && !selectableColumns.includes(label)
      ? label
      : undefined;

  const labelItems = [
    ...(noneMeansDefault ? [] : [{value: NO_LABEL, text: 'None'}]),
    ...(unlistedLabel
      ? [{value: unlistedLabel, text: unlistedLabel, disabled: true}]
      : []),
    ...(defaultLabel
      ? [{value: defaultLabel, text: `${defaultLabel} (default)`}]
      : []),
    ...selectableColumns
      .filter(column => column !== defaultLabel)
      .map(column => ({value: column, text: column})),
  ];

  let columnsHelperMessage: string | undefined;
  if (!selectedDataset) {
    columnsHelperMessage = 'Choose a dataset first.';
  } else if (!columns && !columnsFailed) {
    columnsHelperMessage = "Loading the dataset's columns...";
  }

  let labelError: string | undefined;
  if (columnsFailed) {
    labelError = "Could not load the dataset's columns.";
  } else if (
    columns &&
    label !== undefined &&
    !columns.selectable.includes(label)
  ) {
    labelError = `Students cannot choose "${label}" in this dataset.`;
  } else if (columns && labelLocked && !startingLabel) {
    labelError = 'This dataset has no default label. Choose a label to lock.';
  }

  const renderCheckbox = (key: BooleanModeKey, checkboxLabel: string) => (
    <Checkbox
      name={`ailab_mode_${key}`}
      label={checkboxLabel}
      checked={mode[key] === true}
      onChange={e =>
        onChange(
          setJsonObjectValue(mode, key, e.target.checked ? true : undefined)
        )
      }
      size="s"
    />
  );

  const handleAccuracyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    const accuracy = Number(text);
    setAccuracyText(text);
    onChange(
      setJsonObjectValue(
        mode,
        'requireAccuracy',
        text.trim() !== '' && isValidAccuracy(accuracy) ? accuracy : undefined
      )
    );
  };
  const accuracyError =
    accuracyText.trim() !== '' && !isValidAccuracy(Number(accuracyText))
      ? 'Enter a number from 0 to 100.'
      : undefined;

  return (
    <div>
      {removed.length > 0 && (
        <Typography variant="body4" className={moduleStyles.warningText}>
          These saved values are not valid for Lab 2 AI Lab and will be removed
          when you save: {removed.join('; ')}
        </Typography>
      )}
      <div className={moduleStyles.fieldArea}>
        <SimpleDropdown
          labelText="Dataset (required)"
          name="ailab_mode_dataset"
          required
          items={datasetItems}
          selectedValue={selectedDataset ?? NO_DATASET}
          onChange={e => onChange(setDataset(mode, e.target.value))}
          helperMessage="Students start with this dataset loaded."
          errorMessage={
            selectedDataset
              ? undefined
              : 'Choose a dataset. The level cannot be saved without one.'
          }
          size="s"
        />
      </div>
      <div className={moduleStyles.fieldArea}>
        <SimpleDropdown
          labelText="Label"
          name="ailab_mode_label"
          required={labelLocked}
          items={labelItems}
          selectedValue={startingLabel ?? NO_LABEL}
          onChange={e => onChange(setLabel(mode, e.target.value || undefined))}
          disabled={!columns}
          helperMessage={
            columnsHelperMessage ?? 'The column students start out predicting.'
          }
          errorMessage={labelError}
          size="s"
        />
        <div className={moduleStyles.booleanField}>
          {renderCheckbox(
            'hideSelectLabel',
            'Lock the label so students cannot change it'
          )}
        </div>
      </div>

      <Typography variant="body2" className={moduleStyles.label}>
        Other Mode Configurations
      </Typography>
      <div className={moduleStyles.fieldArea}>
        <SimpleDropdown
          labelText="Trainer"
          name="ailab_mode_trainer"
          items={TRAINER_ITEMS}
          selectedValue={selectedTrainer}
          onChange={e =>
            onChange(setJsonObjectValue(mode, 'trainer', e.target.value))
          }
          size="s"
        />
      </div>
      <div className={moduleStyles.fieldArea}>
        <TextField
          label="Required accuracy (%)"
          name="ailab_mode_require_accuracy"
          inputType="number"
          // Native limits make the browser refuse to submit an out-of-range value.
          min={MIN_ACCURACY}
          max={MAX_ACCURACY}
          step="any"
          value={accuracyText}
          onChange={handleAccuracyChange}
          helperMessage="Students cannot continue past the results step until the model reaches this accuracy. Leave blank for no requirement."
          errorMessage={accuracyError}
          size="s"
        />
      </div>

      <div className={moduleStyles.fieldArea}>
        {BOOLEAN_FIELDS.map(({key, label: checkboxLabel}) => (
          <div key={key} className={moduleStyles.booleanField}>
            {renderCheckbox(key, checkboxLabel)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AilabModeFields;
