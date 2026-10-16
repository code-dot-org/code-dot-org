import classNames from 'classnames';
import React from 'react';

import CellText from './CellText';

import tableStyles from './dataTable.module.scss';

interface PredictionHeaderProps {
  columns: string[];
  labelColumn: string;
  columnName: (column: string) => string;
  isFeature: (column: string) => boolean;
}

const labelHeader = classNames(tableStyles.header, tableStyles.headerLabel);

const PredictionHeader = ({
  columns,
  labelColumn,
  columnName,
  isFeature,
}: PredictionHeaderProps) => (
  <tr>
    <th
      className={classNames(
        tableStyles.indexCell,
        tableStyles.indexHeader,
        tableStyles.indexColumn
      )}
      aria-label="Row"
    />
    {columns.map(column => (
      <th
        key={column}
        scope="col"
        className={classNames(tableStyles.header, {
          [tableStyles.headerFeature]: isFeature(column),
        })}
      >
        <CellText>{columnName(column)}</CellText>
      </th>
    ))}
    <th scope="col" className={labelHeader}>
      <CellText>{columnName(labelColumn)}</CellText>
    </th>
    <th scope="col" className={labelHeader}>
      <CellText>AI predicts</CellText>
    </th>
  </tr>
);

export default PredictionHeader;
