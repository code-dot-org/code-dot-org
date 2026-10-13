import Checkbox from '@code-dot-org/component-library/checkbox';
import {
  CheckboxDropdown,
  SimpleDropdown,
} from '@code-dot-org/component-library/dropdown';
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
  getFeatures,
  getStartingLabel,
  setDataset,
  setFeatures,
  withoutLabelInFeatures,
} from './ailabMode';
import {DatasetFiles} from './datasetColumns';
import LabelField from './LabelField';
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

  const features = getFeatures(mode);
  const featuresLocked = mode.lockFeatures === true;
  const defaultLabel = columns?.defaultLabel;
  const startingLabel = getStartingLabel(mode, defaultLabel);
  const selectableColumns = columns?.selectable ?? [];
  const featureColumns = selectableColumns.filter(
    column => column !== startingLabel
  );
  const featureOptions = featureColumns.map(column => ({
    value: column,
    label: column,
  }));

  let columnsHelperMessage: string | undefined;
  if (!selectedDataset) {
    columnsHelperMessage = 'Choose a dataset first.';
  } else if (!columns && !columnsFailed) {
    columnsHelperMessage = "Loading the dataset's columns...";
  }

  const startingFeatures = features.filter(feature =>
    featureColumns.includes(feature)
  );
  const skippedFeatures = columns
    ? features.filter(feature => !featureColumns.includes(feature))
    : [];
  let featuresError: string | undefined;
  if (skippedFeatures.length > 0) {
    featuresError = `Students will not start with these features: ${skippedFeatures.join(
      ', '
    )}.`;
  } else if (columns && featuresLocked && startingFeatures.length === 0) {
    featuresError = 'Choose the features to lock.';
  } else if (
    columns &&
    featuresLocked &&
    selectableColumns.every(column => startingFeatures.includes(column))
  ) {
    featuresError =
      'Leave a column out for students to predict, or choose a label.';
  }

  const changeMode = (newMode: ModeObject) =>
    onChange(withoutLabelInFeatures(newMode, defaultLabel));

  const handleFeatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {value, checked} = e.target;
    changeMode(
      setFeatures(
        mode,
        featureColumns.filter(column =>
          column === value ? checked : features.includes(column)
        )
      )
    );
  };

  const renderCheckbox = (key: BooleanModeKey, checkboxLabel: string) => (
    <Checkbox
      name={`ailab_mode_${key}`}
      label={checkboxLabel}
      checked={mode[key] === true}
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
            'Lock the label so students cannot change it'
          )}
        </div>
      </div>
      <div className={moduleStyles.fieldArea}>
        <CheckboxDropdown
          labelText="Features"
          aria-label={`Features, ${startingFeatures.join(', ') || 'None'}`}
          name="ailab_mode_features"
          styleAsFormField
          allOptions={featureOptions}
          checkedOptions={startingFeatures}
          onChange={handleFeatureChange}
          onSelectAll={() => changeMode(setFeatures(mode, featureColumns))}
          onClearAll={() => changeMode(setFeatures(mode, []))}
          selectAllText="Select all"
          clearAllText="Clear"
          doneText="Done"
          disabled={!columns}
          helperMessage={
            columnsHelperMessage ??
            'The columns students start out predicting from.'
          }
          errorMessage={featuresError}
          size="s"
        />
        <div className={moduleStyles.booleanField}>
          {renderCheckbox(
            'lockFeatures',
            'Lock the features so students cannot change them'
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
