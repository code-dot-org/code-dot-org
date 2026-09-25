import Checkbox from '@code-dot-org/component-library/checkbox';
import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import {RadioButton} from '@code-dot-org/component-library/radioButton';
import TextField from '@code-dot-org/component-library/textField';
import {Typography} from '@mui/material';
import React, {useState} from 'react';

import {
  BooleanModeKey,
  getDatasetProblem,
  getSelectedDataset,
  getUnknownKeys,
  isValidAccuracy,
  isValidModeValue,
  ModeObject,
  setModeValue,
} from './ailabMode';

import moduleStyles from './edit-ailab-mode.module.scss';

export interface AilabDataset {
  id: string;
  name: string;
  isToy?: boolean;
}

interface AilabModeFieldsProps {
  mode: ModeObject;
  datasets: AilabDataset[];
  onChange: (mode: ModeObject) => void;
}

const BOOLEAN_FIELDS: {key: BooleanModeKey; label: string}[] = [
  {
    key: 'hideSelectLabel',
    label:
      "Skip choosing a label; use the dataset's default label column instead",
  },
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

const DEFAULT_TRAINER = '';
const TRAINER_ITEMS = [
  {value: DEFAULT_TRAINER, text: 'Default (k-nearest neighbors)'},
  {value: 'knn', text: 'k-nearest neighbors'},
  {value: 'decisionTree', text: 'Decision tree'},
];

const AilabModeFields: React.FunctionComponent<AilabModeFieldsProps> = ({
  mode,
  datasets,
  onChange,
}) => {
  const [accuracyText, setAccuracyText] = useState(() =>
    isValidAccuracy(mode.requireAccuracy) ? String(mode.requireAccuracy) : ''
  );

  const invalidValueNote = (key: string) =>
    isValidModeValue(key, mode[key]) ? null : (
      <Typography variant="body4" className={moduleStyles.warningText}>
        The saved value {JSON.stringify(mode[key])} is not valid here. It is
        kept as-is until you change this field.
      </Typography>
    );

  const knownDatasetIds = datasets.map(dataset => dataset.id);
  const selectedDataset = getSelectedDataset(mode, knownDatasetIds);
  const datasetProblem = getDatasetProblem(mode, knownDatasetIds);

  // One radio name across both groups, so they form a single selection.
  const renderDatasetGroup = (legend: string, group: AilabDataset[]) => (
    <fieldset className={moduleStyles.datasetGroup}>
      <legend className={moduleStyles.legend}>
        <Typography variant="body3" component="span">
          <Typography variant="strong">{legend}</Typography>
        </Typography>
      </legend>
      <div className={moduleStyles.datasetList}>
        {group.map(dataset => (
          <RadioButton
            key={dataset.id}
            name="ailab_mode_dataset"
            value={dataset.id}
            label={`${dataset.name} (${dataset.id})`}
            checked={selectedDataset === dataset.id}
            onChange={() =>
              onChange(setModeValue(mode, 'datasets', [dataset.id]))
            }
            size="s"
          />
        ))}
      </div>
    </fieldset>
  );

  const trainerIsValid = isValidModeValue('trainer', mode.trainer);
  const trainerItems = trainerIsValid
    ? TRAINER_ITEMS
    : [
        ...TRAINER_ITEMS,
        {
          value: JSON.stringify(mode.trainer),
          text: `Unrecognized: ${JSON.stringify(mode.trainer)} (kept as-is)`,
        },
      ];
  const selectedTrainer = trainerIsValid
    ? (mode.trainer as string | undefined) ?? DEFAULT_TRAINER
    : JSON.stringify(mode.trainer);

  const handleAccuracyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setAccuracyText(text);
    onChange(
      setModeValue(
        mode,
        'requireAccuracy',
        text.trim() === '' ? undefined : Number(text)
      )
    );
  };
  const accuracyError =
    accuracyText.trim() !== '' && !isValidAccuracy(Number(accuracyText))
      ? 'Enter a number from 0 to 100.'
      : undefined;

  const unknownKeys = getUnknownKeys(mode);

  return (
    <div>
      <div className={moduleStyles.fieldArea}>
        <Typography variant="body2" className={moduleStyles.label}>
          Dataset (required)
        </Typography>
        <Typography variant="body4" className={moduleStyles.descriptionText}>
          Students start with this dataset loaded.
        </Typography>
        {datasetProblem && (
          <Typography variant="body4" className={moduleStyles.warningText}>
            {datasetProblem}
          </Typography>
        )}
        {renderDatasetGroup(
          'Regular datasets',
          datasets.filter(dataset => !dataset.isToy)
        )}
        {renderDatasetGroup(
          'Toy datasets',
          datasets.filter(dataset => dataset.isToy)
        )}
      </div>

      <Typography variant="body2" className={moduleStyles.label}>
        Other Mode Configurations
      </Typography>
      <div className={moduleStyles.fieldArea}>
        <SimpleDropdown
          labelText="Trainer"
          name="ailab_mode_trainer"
          items={trainerItems}
          selectedValue={selectedTrainer}
          onChange={e =>
            onChange(
              setModeValue(
                mode,
                'trainer',
                e.target.value === DEFAULT_TRAINER ? undefined : e.target.value
              )
            )
          }
          size="s"
        />
      </div>
      <div className={moduleStyles.fieldArea}>
        <TextField
          label="Required accuracy (%)"
          name="ailab_mode_require_accuracy"
          inputType="number"
          value={accuracyText}
          onChange={handleAccuracyChange}
          helperMessage="Students cannot continue past the results step until the model reaches this accuracy. Leave blank for no requirement."
          errorMessage={accuracyError}
          size="s"
        />
        {invalidValueNote('requireAccuracy')}
      </div>

      <div className={moduleStyles.fieldArea}>
        {BOOLEAN_FIELDS.map(({key, label}) => (
          <div key={key} className={moduleStyles.booleanField}>
            <Checkbox
              name={`ailab_mode_${key}`}
              label={label}
              checked={mode[key] === true}
              onChange={e =>
                onChange(
                  setModeValue(mode, key, e.target.checked ? true : undefined)
                )
              }
              size="s"
            />
            {invalidValueNote(key)}
          </div>
        ))}
      </div>

      {unknownKeys.length > 0 && (
        <Typography variant="body4" className={moduleStyles.descriptionText}>
          Other keys, not used by Lab 2 AI Lab, kept as-is:{' '}
          {unknownKeys.join(', ')}
        </Typography>
      )}
    </div>
  );
};

export default AilabModeFields;
