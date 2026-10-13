import Checkbox from '@code-dot-org/component-library/checkbox';
import {CheckboxDropdown} from '@code-dot-org/component-library/dropdown';
import React, {useEffect, useRef} from 'react';

import {setJsonObjectValue} from '../jsonUtils';

import {
  getFeatures,
  getStartingLabel,
  ModeObject,
  setFeatures,
} from './ailabMode';
import {DatasetColumns} from './datasetColumns';

import moduleStyles from './edit-ailab-mode.module.scss';

interface FeaturesFieldProps {
  mode: ModeObject;
  columns: DatasetColumns | undefined;
  helperMessage: string;
  onChange: (mode: ModeObject) => void;
}

const FeaturesField: React.FunctionComponent<FeaturesFieldProps> = ({
  mode,
  columns,
  helperMessage,
  onChange,
}) => {
  const lockRef = useRef<HTMLDivElement>(null);
  const savedFeatures = getFeatures(mode);
  const locked = mode.lockFeatures === true;
  const pretrained = mode.pretrained === true;
  const startingLabel = getStartingLabel(mode, columns?.defaultLabel);
  const selectable = columns?.selectable ?? [];
  const choices = selectable.filter(column => column !== startingLabel);

  const startingFeatures = savedFeatures.filter(feature =>
    choices.includes(feature)
  );
  const skippedFeatures = columns
    ? savedFeatures.filter(feature => !choices.includes(feature))
    : [];

  let lockError: string | undefined;
  if (columns && locked && startingFeatures.length === 0) {
    lockError = 'Choose the features to lock.';
  } else if (
    columns &&
    locked &&
    selectable.every(column => startingFeatures.includes(column))
  ) {
    lockError =
      'Leave a column out for students to predict, or choose a label.';
  }
  const error =
    skippedFeatures.length > 0
      ? `Students will not start with these features: ${skippedFeatures.join(
          ', '
        )}.`
      : lockError;

  // Checkbox does not forward refs; an invalid lock stops the level from saving.
  useEffect(() => {
    lockRef.current!.querySelector('input')!.setCustomValidity(lockError ?? '');
  }, [lockError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {value, checked} = e.target;
    onChange(
      setFeatures(
        mode,
        choices.filter(column =>
          column === value ? checked : savedFeatures.includes(column)
        )
      )
    );
  };

  return (
    <>
      <CheckboxDropdown
        labelText="Features"
        aria-label={`Features, ${startingFeatures.join(', ') || 'None'}`}
        name="ailab_mode_features"
        styleAsFormField
        allOptions={choices.map(column => ({value: column, label: column}))}
        checkedOptions={startingFeatures}
        onChange={handleChange}
        onSelectAll={() => onChange(setFeatures(mode, choices))}
        onClearAll={() => onChange(setFeatures(mode, []))}
        selectAllText="Select all"
        clearAllText="Clear"
        doneText="Done"
        disabled={!columns}
        helperMessage={helperMessage}
        errorMessage={error}
        size="s"
      />
      <div ref={lockRef} className={moduleStyles.booleanField}>
        <Checkbox
          name="ailab_mode_lockFeatures"
          label="Lock the features so students cannot change them"
          checked={locked || pretrained}
          disabled={pretrained}
          onChange={e =>
            onChange(
              setJsonObjectValue(
                mode,
                'lockFeatures',
                e.target.checked ? true : undefined
              )
            )
          }
          size="s"
        />
      </div>
    </>
  );
};

export default FeaturesField;
