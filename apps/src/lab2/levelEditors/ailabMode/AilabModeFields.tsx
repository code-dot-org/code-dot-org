import Checkbox from '@code-dot-org/component-library/checkbox';
import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import {RadioButton} from '@code-dot-org/component-library/radioButton';
import TextField from '@code-dot-org/component-library/textField';
import {Typography} from '@mui/material';
import React, {useState} from 'react';

import {
  BooleanModeKey,
  DEFAULT_TRAINER,
  getSelectedDataset,
  isValidAccuracy,
  MAX_ACCURACY,
  MIN_ACCURACY,
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
  // Saved values that were not valid and are dropped from the mode.
  removed: string[];
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
            required
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

  const selectedTrainer =
    (mode.trainer as string | undefined) ?? DEFAULT_TRAINER;

  const handleAccuracyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    const accuracy = Number(text);
    setAccuracyText(text);
    onChange(
      setModeValue(
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
        <Typography variant="body2" className={moduleStyles.label}>
          Dataset (required)
        </Typography>
        <Typography variant="body4" className={moduleStyles.descriptionText}>
          Students start with this dataset loaded.
        </Typography>
        {!selectedDataset && (
          <Typography variant="body4" className={moduleStyles.warningText}>
            Choose a dataset. The level cannot be saved without one.
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
          items={TRAINER_ITEMS}
          selectedValue={selectedTrainer}
          onChange={e =>
            onChange(setModeValue(mode, 'trainer', e.target.value))
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default AilabModeFields;
