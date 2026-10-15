import {Typography} from '@mui/material';
import classNames from 'classnames';

import {DATA_TABLE_ROW_LIMIT} from '../constants';
import {getLocalizedColumnName} from '../helpers/columnDetails';
import {getLocalizedValue} from '../helpers/valueDetails';
import {useAppSelector} from '../hooks';
import {useProject} from '../ProjectContext';

import CellText from './CellText';

import tableStyles from './dataTable.module.scss';
import styles from './nodeRowsTable.module.scss';

interface NodeRowsTableProps {
  // Dataset row numbers.
  rows: number[];
  emphasizedColumn?: string;
  // When false, only the model's features and label.
  allColumns: boolean;
  emptyText: string;
}

const NodeRowsTable = ({
  rows,
  emphasizedColumn,
  allColumns,
  emptyText,
}: NodeRowsTableProps) => {
  const {project} = useProject();
  const data = useAppSelector(state => state.data);
  const datasetId = useAppSelector(state => state.metadata?.name || 'unknown');
  const columns = allColumns
    ? Object.keys(data[0] ?? {})
    : [...project.selectedFeatures, project.labelColumn || 'unknown'];
  const shownRows = rows.slice(0, DATA_TABLE_ROW_LIMIT);

  const isLabel = (column: string) => column === project.labelColumn;
  const isFeature = (column: string) =>
    !isLabel(column) && project.selectedFeatures.includes(column);

  return (
    <>
      <div className={styles.frame}>
        <div className={styles.scroller}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th
                  className={classNames(
                    tableStyles.indexCell,
                    tableStyles.indexHeader,
                    styles.indexColumn,
                  )}
                  aria-label="Row"
                />
                {columns.map(column => (
                  <th
                    key={column}
                    scope="col"
                    className={classNames(tableStyles.header, {
                      [tableStyles.headerLabel]: isLabel(column),
                      [tableStyles.headerFeature]: isFeature(column),
                    })}
                  >
                    <CellText>
                      {getLocalizedColumnName(datasetId, column)}
                    </CellText>
                  </th>
                ))}
              </tr>
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
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
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
      {rows.length > shownRows.length && (
        <Typography variant="body4" component="p" className={styles.note}>
          Showing the first {shownRows.length} rows.
        </Typography>
      )}
    </>
  );
};

export default NodeRowsTable;
