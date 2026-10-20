import classNames from 'classnames';
import React from 'react';

import {getColumnRole, getLocalizedColumnName} from '../helpers/columnDetails';
import {useAppSelector} from '../hooks';
import {useProject} from '../ProjectContext';
import type {TableView} from '../useTableView';

import CellText from './CellText';
import ColumnHeader from './ColumnHeader';

import tableStyles from './dataTable.module.scss';

interface RowsTableHeaderProps {
  columns: string[];
  view: TableView;
  showPrediction?: boolean;
}

const RowsTableHeader = ({
  columns,
  view,
  showPrediction,
}: RowsTableHeaderProps) => {
  const {project} = useProject();
  const datasetId = useAppSelector(state => state.metadata?.name || 'unknown');

  return (
    <tr>
      <th
        className={classNames(
          tableStyles.indexCell,
          tableStyles.indexHeader,
          tableStyles.indexColumn
        )}
        aria-label="Row"
      />
      {columns.map(column => {
        const role = getColumnRole(project, column);
        const columnName = getLocalizedColumnName(datasetId, column);
        return (
          <ColumnHeader
            key={column}
            column={column}
            name={columnName}
            view={view}
            className={classNames(tableStyles.header, {
              [tableStyles.headerLabel]: role === 'label',
              [tableStyles.headerFeature]: role === 'feature',
            })}
          >
            <CellText>{columnName}</CellText>
          </ColumnHeader>
        );
      })}
      {showPrediction && (
        <th
          scope="col"
          className={classNames(tableStyles.header, tableStyles.headerLabel)}
        >
          <CellText>AI predicts</CellText>
        </th>
      )}
    </tr>
  );
};

export default RowsTableHeader;
