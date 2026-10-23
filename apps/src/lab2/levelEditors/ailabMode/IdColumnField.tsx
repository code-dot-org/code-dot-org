import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import React from 'react';

import {ModeObject, setIdColumn} from './ailabMode';
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
  const choices = columns?.all ?? [];
  const savedIdColumnUnlisted =
    savedIdColumn !== undefined && !choices.includes(savedIdColumn);

  const items = [
    {value: NO_ID_COLUMN, text: 'None: number the rows'},
    ...(savedIdColumnUnlisted
      ? [{value: savedIdColumn, text: savedIdColumn, disabled: true}]
      : []),
    ...choices.map(column => ({value: column, text: column})),
  ];

  return (
    <SimpleDropdown
      labelText="ID column"
      name="ailab_mode_idColumn"
      items={items}
      selectedValue={savedIdColumn ?? NO_ID_COLUMN}
      onChange={e => onChange(setIdColumn(mode, e.target.value || undefined))}
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
