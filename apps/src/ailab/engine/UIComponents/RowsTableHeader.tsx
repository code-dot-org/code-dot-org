import classNames from 'classnames';
import React from 'react';

import {getColumnRole, getLocalizedColumnName} from '../helpers/columnDetails';
import {useAppSelector} from '../hooks';
import {useProject} from '../ProjectContext';
import {getIdColumn} from '../selectors';
import type {TableView} from '../types';

import CellText from './CellText';
import ColumnHeader from './ColumnHeader';

import tableStyles from './dataTable.module.scss';

export const PREDICTION_COLUMN = Symbol('AI prediction');
export const PREDICTION_COLUMN_NAME = 'AI predicts';

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
  const idColumn = useAppSelector(getIdColumn);

  return (
    <tr>
      <th
        className={classNames(
          tableStyles.indexCell,
          tableStyles.indexHeader,
          tableStyles.indexColumn,
          {[tableStyles.frozenIndex]: idColumn}
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
              [tableStyles.idHeader]: column === idColumn,
            })}
          >
            <CellText>{columnName}</CellText>
          </ColumnHeader>
        );
      })}
      {showPrediction && (
        <ColumnHeader
          column={PREDICTION_COLUMN}
          name={PREDICTION_COLUMN_NAME}
          view={view}
          className={classNames(tableStyles.header, tableStyles.headerLabel)}
        >
          <CellText>{PREDICTION_COLUMN_NAME}</CellText>
        </ColumnHeader>
      )}
    </tr>
  );
};

export default RowsTableHeader;
