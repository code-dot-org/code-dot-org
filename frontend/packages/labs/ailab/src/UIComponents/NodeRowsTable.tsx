import {Typography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import {DATA_TABLE_ROW_LIMIT} from '../constants';
import {displayValue} from '../helpers/displayTreeNodeContent';
import {getLocalizedValue} from '../helpers/valueDetails';
import {useAppSelector} from '../hooks';
import {useProject} from '../ProjectContext';

import CellText from './CellText';
import RowsTableHeader from './RowsTableHeader';

import tableStyles from './dataTable.module.scss';
import styles from './nodeRowsTable.module.scss';

interface NodeRowsTableProps {
  rowIndices: number[];
  emphasizedColumn?: string;
  showAllColumns: boolean;
  emptyText: string;
  prediction?: string | number;
}

const NodeRowsTable = ({
  rowIndices,
  emphasizedColumn,
  showAllColumns,
  emptyText,
  prediction,
}: NodeRowsTableProps) => {
  const {project} = useProject();
  const data = useAppSelector(state => state.data);
  const datasetId = useAppSelector(state => state.metadata?.name || 'unknown');
  const labelColumn = project.labelColumn || 'unknown';
  const showPrediction = prediction !== undefined;
  const datasetColumns = showAllColumns
    ? Object.keys(data[0] ?? {})
    : [...project.selectedFeatures, labelColumn];
  const columns = showPrediction
    ? [...datasetColumns.filter(column => column !== labelColumn), labelColumn]
    : datasetColumns;
  const shownRows = rowIndices.slice(0, DATA_TABLE_ROW_LIMIT);

  const isLabel = (column: string) => column === labelColumn;
  const isFeature = (column: string) =>
    !isLabel(column) && project.selectedFeatures.includes(column);

  return (
    <>
      <div className={styles.frame}>
        <div className={styles.scroller}>
          <table className={tableStyles.table}>
            <thead>
              <RowsTableHeader
                columns={columns}
                showPrediction={showPrediction}
              />
            </thead>
            <tbody>
              {shownRows.map(row => (
                <tr key={row} className={tableStyles.row}>
                  <th scope="row" className={tableStyles.indexCell}>
                    <CellText>{row + 1}</CellText>
                  </th>
                  {columns.map(column => (
                    <td
                      key={column}
                      className={classNames(tableStyles.bodyCell, {
                        [tableStyles.bodyCellLabel]: isLabel(column),
                        [tableStyles.bodyCellFeature]: isFeature(column),
                        [styles.emphasized]: column === emphasizedColumn,
                      })}
                    >
                      <CellText>
                        {getLocalizedValue(data[row][column], datasetId)}
                      </CellText>
                    </td>
                  ))}
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
          {rowIndices.length === 0 && (
            <Typography
              variant="body4"
              component="p"
              className={styles.emptyNote}
            >
              {emptyText}
            </Typography>
          )}
        </div>
      </div>
      {rowIndices.length > shownRows.length && (
        <Typography variant="body4" component="p" className={styles.note}>
          Showing the first {shownRows.length} rows.
        </Typography>
      )}
    </>
  );
};

export default NodeRowsTable;
