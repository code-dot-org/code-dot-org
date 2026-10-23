import classNames from 'classnames';
import React from 'react';

import {REGRESSION_ERROR_TOLERANCE} from '../constants';
import {getColumnRole, isRegression} from '../helpers/columnDetails';
import {useAppSelector} from '../hooks';
import {useProject} from '../ProjectContext';
import type {ResultsData, TableView} from '../types';

import CellText from './CellText';
import DataTableFrame from './DataTableFrame';
import RowsTableHeader, {PREDICTION_COLUMN} from './RowsTableHeader';
import TableEmptyNote from './TableEmptyNote';

import tableStyles from './dataTable.module.scss';
import styles from './resultsTable.module.scss';

interface ResultsTableProps {
  results: ResultsData;
  columns: string[];
  view: TableView;
}

const labelCell = classNames(tableStyles.bodyCell, tableStyles.bodyCellLabel);

const ResultsTable = ({results, columns, view}: ResultsTableProps) => {
  const {project} = useProject();
  const isRegressionMode = useAppSelector(state =>
    isRegression(state, project)
  );

  return (
    <>
      {isRegressionMode && (
        <p className={styles.rangeNote}>
          Predictions are +/- {REGRESSION_ERROR_TOLERANCE}% of range
        </p>
      )}
      <DataTableFrame label="Results">
        <table className={tableStyles.table}>
          <thead>
            <RowsTableHeader columns={columns} view={view} showPrediction />
          </thead>
          <tbody>
            {view.rows.map(index => {
              return (
                <tr key={index} className={tableStyles.row}>
                  <th scope="row" className={tableStyles.indexCell}>
                    <CellText>{results.rowIndices[index] + 1}</CellText>
                  </th>
                  {columns.map(column => {
                    const role = getColumnRole(project, column);
                    return (
                      <td
                        key={column}
                        className={classNames(tableStyles.bodyCell, {
                          [tableStyles.bodyCellLabel]: role === 'label',
                          [tableStyles.bodyCellFeature]: role === 'feature',
                        })}
                      >
                        <CellText>{view.valueAt(index, column)}</CellText>
                      </td>
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
