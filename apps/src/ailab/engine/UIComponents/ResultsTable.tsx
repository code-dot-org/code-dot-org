import classNames from 'classnames';
import React, {type ReactNode} from 'react';

import {REGRESSION_ERROR_TOLERANCE} from '../constants';
import {getColumnRole, isRegression} from '../helpers/columnDetails';
import {useAppSelector} from '../hooks';
import {useProject} from '../ProjectContext';
import {getIdColumn} from '../selectors';
import type {ResultsData, TableView} from '../types';

import CellText from './CellText';
import DataCell from './DataCell';
import DataTableFrame from './DataTableFrame';
import RowNumberCell from './RowNumberCell';
import RowsTableHeader, {PREDICTION_COLUMN} from './RowsTableHeader';
import TableEmptyNote from './TableEmptyNote';

import tableStyles from './dataTable.module.scss';
import styles from './resultsTable.module.scss';

interface ResultsTableProps {
  results: ResultsData;
  columns: string[];
  view: TableView;
  actionRow: ReactNode;
}

const labelCell = classNames(tableStyles.bodyCell, tableStyles.bodyCellLabel);

const ResultsTable = ({
  results,
  columns,
  view,
  actionRow,
}: ResultsTableProps) => {
  const {project} = useProject();
  const isRegressionMode = useAppSelector(state =>
    isRegression(state, project)
  );
  const idColumn = useAppSelector(getIdColumn);

  return (
    <>
      {isRegressionMode && (
        <p className={styles.rangeNote}>
          Predictions are +/- {REGRESSION_ERROR_TOLERANCE}% of range
        </p>
      )}
      <DataTableFrame label="Results" actionRow={actionRow}>
        <table className={tableStyles.table}>
          <thead>
            <RowsTableHeader columns={columns} view={view} showPrediction />
          </thead>
          <tbody>
            {view.rows.map(index => {
              return (
                <tr key={index} className={tableStyles.row}>
                  <RowNumberCell
                    rowNumber={results.rowIndices[index] + 1}
                    besideIdColumn={!!idColumn}
                  />
                  {columns.map(column => {
                    const role = getColumnRole(project, column);
                    return (
                      <DataCell
                        key={column}
                        isIdColumn={column === idColumn}
                        rowNumber={results.rowIndices[index] + 1}
                        value={view.valueAt(index, column)}
                        className={classNames({
                          [tableStyles.bodyCellLabel]: role === 'label',
                          [tableStyles.bodyCellFeature]: role === 'feature',
                        })}
                      />
                    );
                  })}
                  <td className={labelCell}>
                    <CellText>
                      {view.valueAt(index, PREDICTION_COLUMN)}
                    </CellText>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <TableEmptyNote view={view} emptyText="No rows matched this filter" />
      </DataTableFrame>
    </>
  );
};

export default ResultsTable;
