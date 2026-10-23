import classNames from 'classnames';
import React from 'react';

import CellText from './CellText';

import tableStyles from './dataTable.module.scss';

interface RowNumberCellProps {
  rowNumber: number;
  besideIdColumn: boolean;
}

// Beside an id column, the id heads the row and the number freezes with it.
const RowNumberCell = ({rowNumber, besideIdColumn}: RowNumberCellProps) =>
  besideIdColumn ? (
    <td className={classNames(tableStyles.indexCell, tableStyles.frozenIndex)}>
      <CellText>{rowNumber}</CellText>
    </td>
  ) : (
    <th scope="row" className={tableStyles.indexCell}>
      <CellText>{rowNumber}</CellText>
    </th>
  );

export default RowNumberCell;
