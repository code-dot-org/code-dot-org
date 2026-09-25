import Checkbox from '@code-dot-org/component-library/checkbox';
import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import TextField from '@code-dot-org/component-library/textField';
import {Typography} from '@mui/material';
import React, {useState} from 'react';

import {
  BooleanModeKey,
  getUnknownKeys,
  isValidAccuracy,
  isValidModeValue,
  ModeObject,
  parseMode,
  serializeMode,
  setModeValue,
  toggleDataset,
} from './ailabMode';

import moduleStyles from './edit-ailab-mode.module.scss';

export interface AilabDataset {
  id: string;
  name: string;
  isToy?: boolean;
}

interface EditAilabModeProps {
  initialMode: string | null;
  datasets: AilabDataset[];
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
    key: 'hideInstructionsOverlay',
    label:
      'Do not pop up instructions the first time each step is shown (Only applies for legacy levels).',
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

const EditAilabMode: React.FunctionComponent<EditAilabModeProps> = ({
  initialMode,
  datasets,
}) => {
  const [initialParsedMode] = useState(() => parseMode(initialMode));
  const [mode, setMode] = useState<ModeObject>(initialParsedMode ?? {});
  const [isEdited, setIsEdited] = useState(false);
  const [rawMode, setRawMode] = useState(initialMode ?? '');
  const [accuracyText, setAccuracyText] = useState(() =>
    isValidAccuracy(mode.requireAccuracy) ? String(mode.requireAccuracy) : ''
  );

  if (initialParsedMode === null) {
    return (
      <div>
        <Typography variant="body3" className={moduleStyles.warningText}>
          This mode is not a valid JSON object, so it cannot be shown as fields.
          Fix the JSON below, save the level, and reload this page.
        </Typography>
        <label className={moduleStyles.fieldArea}>
          <div className={moduleStyles.label}>Mode JSON</div>
          <textarea
            id="level_mode"
            name="level[mode]"
            rows={10}
            value={rawMode}
            onChange={e => setRawMode(e.target.value)}
            className="input-block-level"
          />
        </label>
      </div>
    );
  }

  const updateMode = (newMode: ModeObject) => {
    setMode(newMode);
    setIsEdited(true);
  };

  const invalidValueNote = (key: string) =>
    isValidModeValue(key, mode[key]) ? null : (
      <Typography variant="body4" className={moduleStyles.warningText}>
        The saved value {JSON.stringify(mode[key])} is not valid here. It is
        kept as-is until you change this field.
      </Typography>
    );

  const selectedDatasetIds = isValidModeValue('datasets', mode.datasets)
    ? (mode.datasets as string[] | undefined) ?? []
    : [];
  const knownDatasetIds = datasets.map(dataset => dataset.id);
  const unrecognizedDatasetIds = selectedDatasetIds.filter(
    id => !knownDatasetIds.includes(id)
  );
  // AI Lab offers upload only when the datasets key is absent; [] hides it.
  const csvUploadLocked = selectedDatasetIds.length > 0;

  const renderDatasetGroup = (legend: string, group: AilabDataset[]) => (
    <fieldset className={moduleStyles.datasetGroup}>
      <legend className={moduleStyles.label}>{legend}</legend>
      <div className={moduleStyles.datasetList}>
        {group.map(dataset => (
          <Checkbox
            key={dataset.id}
            name={`ailab_mode_dataset_${dataset.id}`}
            label={`${dataset.name} (${dataset.id})`}
            checked={selectedDatasetIds.includes(dataset.id)}
            onChange={e =>
              updateMode(toggleDataset(mode, dataset.id, e.target.checked))
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
    updateMode(
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
      <input
        id="level_mode"
        name="level[mode]"
        type="hidden"
        value={isEdited ? serializeMode(mode) : initialMode ?? ''}
      />

      <div className={moduleStyles.fieldArea}>
        <Typography variant="body2" className={moduleStyles.label}>
          Datasets
        </Typography>
        <Typography variant="body4" className={moduleStyles.descriptionText}>
          None selected: students choose from all regular datasets. One
          selected: it loads right away and dataset selection is skipped. Two or
          more: students choose among them.
        </Typography>
        {invalidValueNote('datasets')}
        {unrecognizedDatasetIds.length > 0 && (
          <Typography variant="body4" className={moduleStyles.warningText}>
            Unrecognized dataset IDs, kept as-is:{' '}
            {unrecognizedDatasetIds.join(', ')}
          </Typography>
        )}
        {renderDatasetGroup(
          'Regular datasets',
          datasets.filter(dataset => !dataset.isToy)
        )}
        {renderDatasetGroup(
          'Toy datasets (only offered when selected here)',
          datasets.filter(dataset => dataset.isToy)
        )}
        <Checkbox
          name="ailab_mode_allow_csv_upload"
          label="Allow students to upload their own CSV"
          checked={!mode.datasets}
          disabled={csvUploadLocked}
          onChange={e =>
            updateMode(
              setModeValue(mode, 'datasets', e.target.checked ? undefined : [])
            )
          }
          size="s"
        />
        {csvUploadLocked && (
          <Typography variant="body4" className={moduleStyles.descriptionText}>
            Upload is only available when no datasets are selected.
          </Typography>
        )}
      </div>

      <div className={moduleStyles.fieldArea}>
        <SimpleDropdown
          labelText="Trainer"
          name="ailab_mode_trainer"
          items={trainerItems}
          selectedValue={selectedTrainer}
          onChange={e =>
            updateMode(
              setModeValue(
                mode,
                'trainer',
                e.target.value === DEFAULT_TRAINER ? undefined : e.target.value
              )
            )
          }
          size="s"
        />
        <Typography variant="body4" className={moduleStyles.descriptionText}>
          Only applies when Lab 2 is enabled for this level.
        </Typography>
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
          <div key={key}>
            <Checkbox
              name={`ailab_mode_${key}`}
              label={label}
              checked={mode[key] === true}
              onChange={e =>
                updateMode(
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
          Other keys, not used by AI Lab, kept as-is: {unknownKeys.join(', ')}
        </Typography>
      )}
    </div>
  );
};

export default EditAilabMode;
