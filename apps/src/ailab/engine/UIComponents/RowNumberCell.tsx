import classNames from 'classnames';
import React from 'react';

import CellText from './CellText';
import {testRowLabel} from './testRowLabel';

import tableStyles from './dataTable.module.scss';

interface RowNumberCellProps {
  rowNumber: number;
  besideIdColumn: boolean;
  isTestRow?: boolean;
}

// Beside an id column, the id heads the row and the number freezes with it.
const RowNumberCell = ({
  rowNumber,
  besideIdColumn,
  isTestRow,
}: RowNumberCellProps) => {
  const className = classNames(tableStyles.indexCell, {
    [tableStyles.frozenIndex]: besideIdColumn,
    [tableStyles.testRow]: isTestRow,
  });
  return besideIdColumn ? (
    <td className={className}>
      <CellText>{rowNumber}</CellText>
    </td>
  ) : (
    <th
      scope="row"
      aria-label={isTestRow ? testRowLabel(rowNumber) : undefined}
      className={className}
    >
      <CellText>{rowNumber}</CellText>
    </th>
  );
};

export default RowNumberCell;
