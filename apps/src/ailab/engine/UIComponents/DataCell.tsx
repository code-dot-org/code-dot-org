import classNames from 'classnames';
import React from 'react';

import CellText from './CellText';

import tableStyles from './dataTable.module.scss';

interface DataCellProps {
  isIdColumn: boolean;
  rowNumber: number;
  value: string | number;
  className?: string;
  onClick?: () => void;
}

const DataCell = ({
  isIdColumn,
  rowNumber,
  value,
  className,
  onClick,
}: DataCellProps) =>
  isIdColumn ? (
    <th
      scope="row"
      aria-label={value === '' ? `Row ${rowNumber}` : undefined}
      className={classNames(
        tableStyles.indexCell,
        tableStyles.idCell,
        className
      )}
      onClick={onClick}
    >
      <CellText>{value}</CellText>
    </th>
  ) : (
    <td
      className={classNames(tableStyles.bodyCell, className)}
      onClick={onClick}
    >
      <CellText>{value}</CellText>
    </td>
  );

export default DataCell;
