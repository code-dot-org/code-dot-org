import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import React from 'react';

import {setJsonObjectValue} from '../jsonUtils';

import {ModeObject} from './ailabMode';
import {DatasetColumns} from './datasetColumns';

const NO_LABEL = '';

interface LabelFieldProps {
  mode: ModeObject;
  columns: DatasetColumns | undefined;
  columnsFailed: boolean;
  helperMessage: string;
  onChange: (mode: ModeObject) => void;
}

const LabelField: React.FunctionComponent<LabelFieldProps> = ({
  mode,
  columns,
  columnsFailed,
  helperMessage,
  onChange,
}) => {
  const savedLabel = mode.label as string | undefined;
  const locked = mode.hideSelectLabel === true;
  const defaultLabel = columns?.defaultLabel;
  const choices = columns?.selectable ?? [];

  const savedLabelUnlisted =
    savedLabel !== undefined && !choices.includes(savedLabel);
  const savedLabelUnavailable = !!columns && savedLabelUnlisted;
  const startingLabel = savedLabel ?? (locked ? defaultLabel : undefined);
  const shownLabel =
    locked && savedLabelUnavailable ? undefined : startingLabel;
  const offerNone = !locked || shownLabel === undefined;

  const items = [
    ...(offerNone ? [{value: NO_LABEL, text: 'None'}] : []),
    ...(savedLabelUnlisted
      ? [{value: savedLabel, text: savedLabel, disabled: true}]
      : []),
    ...(defaultLabel
      ? [{value: defaultLabel, text: `${defaultLabel} (default)`}]
      : []),
    ...choices
      .filter(column => column !== defaultLabel)
      .map(column => ({value: column, text: column})),
  ];

  let error: string | undefined;
  if (columnsFailed) {
    error = "Could not load the dataset's columns.";
  } else if (savedLabelUnavailable) {
    error = `Students cannot choose "${savedLabel}" in this dataset.`;
  } else if (columns && locked && shownLabel === undefined) {
    error = 'This dataset has no default label. Choose a label to lock.';
  }

  return (
    <SimpleDropdown
      labelText="Label"
      name="ailab_mode_label"
      required={locked}
      items={items}
      selectedValue={shownLabel ?? NO_LABEL}
      onChange={e =>
        onChange(setJsonObjectValue(mode, 'label', e.target.value || undefined))
      }
      disabled={!columns}
      helperMessage={helperMessage}
      errorMessage={error}
      size="s"
    />
  );
};

export default LabelField;
