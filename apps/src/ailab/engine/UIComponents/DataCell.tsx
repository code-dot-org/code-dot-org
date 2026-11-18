import classNames from 'classnames';
import React from 'react';

import CellText from './CellText';
import {testRowLabel} from './testRowLabel';

import tableStyles from './dataTable.module.scss';

interface DataCellProps {
  isIdColumn: boolean;
  isTestRow?: boolean;
  rowNumber: number;
  value: string | number;
  className?: string;
  onClick?: () => void;
}

const DataCell = ({
  isIdColumn,
  isTestRow,
  rowNumber,
  value,
  className,
  onClick,
}: DataCellProps) => {
  if (!isIdColumn) {
    return (
      <td
        className={classNames(tableStyles.bodyCell, className)}
        onClick={onClick}
      >
        <CellText>{value}</CellText>
      </td>
    );
  }

  const header = value === '' ? `Row ${rowNumber}` : String(value);
  return (
    <th
      scope="row"
      aria-label={
        isTestRow ? testRowLabel(header) : value === '' ? header : undefined
      }
      className={classNames(
        tableStyles.indexCell,
        tableStyles.idCell,
        className
      )}
      onClick={onClick}
    >
      <CellText>{value}</CellText>
    </th>
  );
};

export default DataCell;
