import {Typography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import {DATA_TABLE_ROW_LIMIT} from '../constants';
import {getColumnRole} from '../helpers/columnDetails';
import {displayValue} from '../helpers/displayTreeNodeContent';
import {getLocalizedValue} from '../helpers/valueDetails';
import {useAppSelector} from '../hooks';
import {useProject} from '../ProjectContext';
import type {TableView} from '../useTableView';

import CellText from './CellText';
import DataTableFrame from './DataTableFrame';
import RowsTableHeader from './RowsTableHeader';

import tableStyles from './dataTable.module.scss';
import styles from './nodeRowsTable.module.scss';

interface NodeRowsTableProps {
  labelId: string;
  view: TableView;
  columns: string[];
  emphasizedColumn?: string;
  emptyText: string;
  prediction?: string | number;
}

const NodeRowsTable = ({
  labelId,
  view,
  columns,
  emphasizedColumn,
  emptyText,
  prediction,
}: NodeRowsTableProps) => {
  const {project} = useProject();
  const data = useAppSelector(state => state.data);
  const datasetId = useAppSelector(state => state.metadata?.name || 'unknown');
  const showPrediction = prediction !== undefined;
  const shownRows = view.rows.slice(0, DATA_TABLE_ROW_LIMIT);

  return (
    <>
      <DataTableFrame labelId={labelId}>
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
                <th scope="row" className={tableStyles.indexCell}>
                  <CellText>{row + 1}</CellText>
                </th>
                {columns.map(column => {
                  const role = getColumnRole(project, column);
                  return (
                    <td
                      key={column}
                      className={classNames(tableStyles.bodyCell, {
                        [tableStyles.bodyCellLabel]: role === 'label',
                        [tableStyles.bodyCellFeature]: role === 'feature',
                        [styles.emphasized]: column === emphasizedColumn,
                      })}
                    >
                      <CellText>
                        {getLocalizedValue(data[row][column], datasetId)}
                      </CellText>
                    </td>
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
        {view.rows.length === 0 && (
          <Typography
            variant="body4"
            component="p"
            className={styles.emptyNote}
          >
            {emptyText}
          </Typography>
        )}
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
