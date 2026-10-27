import {Typography} from '@mui/material';
import classNames from 'classnames';
import React, {type ReactNode} from 'react';

import {DATA_TABLE_ROW_LIMIT} from '../constants';
import {getColumnRole} from '../helpers/columnDetails';
import {displayValue} from '../helpers/displayTreeNodeContent';
import {getLocalizedValue} from '../helpers/valueDetails';
import {useAppSelector} from '../hooks';
import {useProject} from '../ProjectContext';
import {getData, getDatasetId, getIdColumn} from '../selectors';
import type {DatasetTableView} from '../types';

import CellText from './CellText';
import DataCell from './DataCell';
import DataTableFrame from './DataTableFrame';
import RowNumberCell from './RowNumberCell';
import RowsTableHeader from './RowsTableHeader';
import TableEmptyNote from './TableEmptyNote';

import tableStyles from './dataTable.module.scss';
import styles from './nodeRowsTable.module.scss';

interface NodeRowsTableProps {
  labelId: string;
  view: DatasetTableView;
  emphasizedColumn?: string;
  emptyText: string;
  prediction?: string | number;
  actionRow: ReactNode;
}

const NodeRowsTable = ({
  labelId,
  view,
  emphasizedColumn,
  emptyText,
  prediction,
  actionRow,
}: NodeRowsTableProps) => {
  const {columns} = view;
  const {project} = useProject();
  const data = useAppSelector(getData);
  const datasetId = useAppSelector(state => getDatasetId(state) || 'unknown');
  const idColumn = useAppSelector(getIdColumn);
  const showPrediction = prediction !== undefined;
  const shownRows = view.rows.slice(0, DATA_TABLE_ROW_LIMIT);

  return (
    <>
      <DataTableFrame labelId={labelId} actionRow={actionRow}>
        <table className={tableStyles.table}>
          <thead>
            <RowsTableHeader
              columns={columns}
              view={view}
              showPrediction={showPrediction}
            />
          </thead>
          <tbody>
            {shownRows.map(row => (
              <tr key={row} className={tableStyles.row}>
                <RowNumberCell
                  rowNumber={row + 1}
                  besideIdColumn={!!idColumn}
                />
                {columns.map(column => {
                  const role = getColumnRole(project, column);
                  return (
                    <DataCell
                      key={column}
                      isIdColumn={column === idColumn}
                      rowNumber={row + 1}
                      value={getLocalizedValue(data[row][column], datasetId)}
                      className={classNames({
                        [tableStyles.bodyCellLabel]: role === 'label',
                        [tableStyles.bodyCellFeature]: role === 'feature',
                        [styles.emphasized]: column === emphasizedColumn,
                      })}
                    />
                  );
                })}
                {showPrediction && (
                  <td
                    className={classNames(
                      tableStyles.bodyCell,
                      tableStyles.bodyCellLabel
                    )}
                  >
                    <CellText>{displayValue(prediction, datasetId)}</CellText>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        <TableEmptyNote view={view} emptyText={emptyText} />
      </DataTableFrame>
      {view.rows.length > shownRows.length && (
        <Typography variant="body4" component="p" className={styles.note}>
          Showing the first {shownRows.length} rows.
        </Typography>
      )}
    </>
  );
};

export default NodeRowsTable;
