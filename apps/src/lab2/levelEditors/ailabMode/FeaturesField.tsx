import {CheckboxDropdown} from '@code-dot-org/component-library/dropdown';
import React from 'react';

import {
  getFeatures,
  getStartingLabel,
  ModeObject,
  setFeatures,
} from './ailabMode';
import {DatasetColumns} from './datasetColumns';

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
  const savedFeatures = getFeatures(mode);
  const locked = mode.lockFeatures === true;
  const startingLabel = getStartingLabel(mode, columns?.defaultLabel);
  const selectable = columns?.selectable ?? [];
  const choices = selectable.filter(column => column !== startingLabel);

  const startingFeatures = savedFeatures.filter(feature =>
    choices.includes(feature)
  );
  const skippedFeatures = columns
    ? savedFeatures.filter(feature => !choices.includes(feature))
    : [];

  let error: string | undefined;
  if (skippedFeatures.length > 0) {
    error = `Students will not start with these features: ${skippedFeatures.join(
      ', '
    )}.`;
  } else if (columns && locked && startingFeatures.length === 0) {
    error = 'Choose the features to lock.';
  } else if (
    columns &&
    locked &&
    selectable.every(column => startingFeatures.includes(column))
  ) {
    error = 'Leave a column out for students to predict, or choose a label.';
  }

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
  );
};

export default FeaturesField;
