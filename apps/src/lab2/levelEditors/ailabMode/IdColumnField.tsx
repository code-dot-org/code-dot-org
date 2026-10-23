import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import React from 'react';

import {setJsonObjectValue} from '../jsonUtils';

import {getFeatures, getStartingLabel, ModeObject} from './ailabMode';
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
  const savedIdColumn = mode.idColumn as string | undefined;
  const startingLabel = getStartingLabel(mode, columns?.defaultLabel);
  const features = getFeatures(mode);
  const choices = columns?.all ?? [];
  const savedIdColumnUnlisted =
    savedIdColumn !== undefined && !choices.includes(savedIdColumn);

  const choiceItem = (column: string) => {
    if (column === startingLabel) {
      return {value: column, text: `${column} (label)`, disabled: true};
    }
    if (features.includes(column)) {
      return {value: column, text: `${column} (feature)`, disabled: true};
    }
    return {value: column, text: column};
  };

  const items = [
    {value: NO_ID_COLUMN, text: 'None: number the rows'},
    ...(savedIdColumnUnlisted
      ? [{value: savedIdColumn, text: savedIdColumn, disabled: true}]
      : []),
    ...choices.map(choiceItem),
  ];

  return (
    <SimpleDropdown
      labelText="ID column"
      name="ailab_mode_idColumn"
      items={items}
      selectedValue={savedIdColumn ?? NO_ID_COLUMN}
      onChange={e =>
        onChange(
          setJsonObjectValue(mode, 'idColumn', e.target.value || undefined)
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
