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
  REPLACED_BY_PRETRAINED,
  setDataset,
  withoutLabelInFeatures,
} from './ailabMode';
import {DatasetFiles} from './datasetColumns';
import FeaturesField from './FeaturesField';
import LabelField from './LabelField';
import PretrainedField from './PretrainedField';
import {useDatasetColumns} from './useDatasetColumns';

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
  const pretrained = mode.pretrained === true;

  let columnsHelperMessage: string | undefined;
  if (!selectedDataset) {
    columnsHelperMessage = 'Choose a dataset first.';
  } else if (!columns && !columnsFailed) {
    columnsHelperMessage = "Loading the dataset's columns...";
  }

  const changeMode = (newMode: ModeObject) =>
    onChange(withoutLabelInFeatures(newMode, columns?.defaultLabel));

  const renderCheckbox = (
    key: BooleanModeKey,
    checkboxLabel: string,
    checked = mode[key] === true
  ) => (
    <Checkbox
      name={`ailab_mode_${key}`}
      label={checkboxLabel}
      checked={checked}
      disabled={pretrained && REPLACED_BY_PRETRAINED.includes(key)}
      onChange={e =>
        changeMode(
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
    changeMode(
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
          onChange={e => changeMode(setDataset(mode, e.target.value))}
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
        <LabelField
          mode={mode}
          columns={columns}
          columnsFailed={columnsFailed}
          helperMessage={
            columnsHelperMessage ?? 'The column students start out predicting.'
          }
          onChange={changeMode}
        />
        <div className={moduleStyles.booleanField}>
          {renderCheckbox(
            'hideSelectLabel',
            'Lock the label so students cannot change it',
            pretrained || mode.hideSelectLabel === true
          )}
        </div>
      </div>
      <div className={moduleStyles.fieldArea}>
        <FeaturesField
          mode={mode}
          columns={columns}
          helperMessage={
            columnsHelperMessage ??
            'The columns students start out predicting from.'
          }
          onChange={changeMode}
        />
      </div>
      <div className={moduleStyles.fieldArea}>
        <PretrainedField
          mode={mode}
          columns={columns}
          onChange={newMode => {
            setAccuracyText('');
            changeMode(newMode);
          }}
        />
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
            changeMode(setJsonObjectValue(mode, 'trainer', e.target.value))
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
          disabled={pretrained}
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
