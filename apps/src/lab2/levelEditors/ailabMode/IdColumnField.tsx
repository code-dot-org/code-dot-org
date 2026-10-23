import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import React from 'react';

import {setJsonObjectValue} from '../jsonUtils';

import {
  getFeatures,
  getLevelIdColumn,
  getStartingLabel,
  ModeObject,
} from './ailabMode';
import {DatasetColumns} from './datasetColumns';

const NO_ID_COLUMN = '';

interface IdColumnFieldProps {
  mode: ModeObject;
  columns: DatasetColumns | undefined;
  helperMessage: string;
  onChange: (mode: ModeObject) => void;
}

const IdColumnField: React.FunctionComponent<IdColumnFieldProps> = ({
  mode,
  columns,
  helperMessage,
  onChange,
}) => {
  const savedIdColumn = mode.idColumn as string | null | undefined;
  const defaultIdColumn = columns?.defaultIdColumn;
  const shownIdColumn = getLevelIdColumn(mode, defaultIdColumn);
  const startingLabel = getStartingLabel(mode, columns?.defaultLabel);
  const features = getFeatures(mode);
  const choices = columns?.all ?? [];
  const savedIdColumnUnlisted =
    typeof savedIdColumn === 'string' && !choices.includes(savedIdColumn);

  const choiceItem = (column: string) => {
    if (column === startingLabel) {
      return {value: column, text: `${column} (label)`, disabled: true};
    }
    if (features.includes(column)) {
      return {value: column, text: `${column} (feature)`, disabled: true};
    }
    if (column === defaultIdColumn) {
      return {value: column, text: `${column} (default)`};
    }
    return {value: column, text: column};
  };

  // The mode records only a change from the dataset's default.
  const modeValue = (value: string) => {
    if (value === NO_ID_COLUMN) {
      return defaultIdColumn ? null : undefined;
    }
    return value === defaultIdColumn ? undefined : value;
  };

  const items = [
    {value: NO_ID_COLUMN, text: 'None: number the rows'},
    ...(savedIdColumnUnlisted
      ? [{value: savedIdColumn, text: savedIdColumn, disabled: true}]
      : []),
    ...(defaultIdColumn ? [choiceItem(defaultIdColumn)] : []),
    ...choices.filter(column => column !== defaultIdColumn).map(choiceItem),
  ];

  return (
    <SimpleDropdown
      labelText="ID column"
      name="ailab_mode_idColumn"
      items={items}
      selectedValue={shownIdColumn ?? NO_ID_COLUMN}
      onChange={e =>
        onChange(
          setJsonObjectValue(mode, 'idColumn', modeValue(e.target.value))
        )
      }
      disabled={!columns}
      helperMessage={helperMessage}
      errorMessage={
        columns && savedIdColumnUnlisted
          ? `This dataset has no column "${savedIdColumn}".`
          : undefined
      }
      size="s"
    />
  );
};

export default IdColumnField;
