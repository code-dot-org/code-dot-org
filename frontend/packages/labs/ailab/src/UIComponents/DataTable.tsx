/* React component to handle displaying imported data. */
import classNames from 'classnames';

import {getLocalizedColumnName} from '../helpers/columnDetails';
import {getLocalizedValue} from '../helpers/valueDetails';
import {deepEqual, useAppDispatch, useAppSelector} from '../hooks';
import {getColumnClickable, getTableData, setCurrentColumn} from '../redux';

import styles from './dataTable.module.scss';

interface DataTableProps {
  reducedColumns?: boolean;
  singleRow?: number;
  startingRow?: number;
  noLabel?: boolean;
  hideLabel?: boolean;
  useResultsData?: boolean;
}

const DataTable = ({
  reducedColumns,
  singleRow,
  startingRow,
  noLabel,
  hideLabel,
  useResultsData,
}: DataTableProps) => {
  const dispatch = useAppDispatch();
  const data = useAppSelector(
    state => getTableData(state, !!useResultsData),
    deepEqual,
  );
  const datasetId = useAppSelector(state => state.metadata?.name || 'unknown');
  const labelColumn = useAppSelector(state => state.labelColumn || 'unknown');
  const selectedFeatures = useAppSelector(state => state.selectedFeatures);
  const currentColumn = useAppSelector(state => state.currentColumn);
  const clickableColumns = useAppSelector(
    state =>
      reducedColumns
        ? []
        : Object.keys(data[0] ?? {}).filter(key =>
            getColumnClickable(state, key),
          ),
    deepEqual,
  );

  const showRowNumbers = !reducedColumns;

  const isClickable = (key: string) => clickableColumns.includes(key);

  const getColumnHeaderClassName = (key: string) =>
    classNames(styles.header, {
      [styles.headerLabel]: key === labelColumn,
      [styles.headerFeature]:
        key !== labelColumn && selectedFeatures.includes(key),
      [styles.headerSelected]: !reducedColumns && key === currentColumn,
      [styles.clickable]: isClickable(key),
    });

  const getColumnCellClassName = (key: string) => {
    let variant;
    if (hideLabel && key === labelColumn) {
      variant = styles.bodyCellHidden;
    } else if (key === labelColumn) {
      variant = styles.bodyCellLabel;
    } else if (selectedFeatures.includes(key)) {
      variant = styles.bodyCellFeature;
    }

    return classNames('uitest-data-table-column', styles.bodyCell, variant, {
      [styles.clickable]: isClickable(key),
    });
  };

  const getColumns = () => {
    if (data.length === 0) {
      return [];
    }

    const columns = Object.keys(data[0]);
    if (reducedColumns) {
      const selected = columns.filter(key => selectedFeatures.includes(key));
      return noLabel ? selected : [...selected, labelColumn];
    }
    return columns;
  };

  const getRows = () => {
    if (data.length === 0) {
      return [];
    }

    if (singleRow !== undefined) {
      return [data[Math.min(singleRow, data.length - 1)]];
    } else {
      return data.slice(0, 100);
    }
  };

  const handleSetCurrentColumn = (columnId: string) => {
    if (isClickable(columnId)) {
      dispatch(setCurrentColumn(columnId));
    }
  };

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          {showRowNumbers && (
            <th
              className={classNames(styles.indexCell, styles.indexHeader)}
              aria-label="Row"
            />
          )}
          {getColumns().map(columnId => {
            const columnName = getLocalizedColumnName(datasetId, columnId);
            return (
              <th
                key={columnId}
                scope="col"
                className={getColumnHeaderClassName(columnId)}
              >
                {isClickable(columnId) ? (
                  <button
                    type="button"
                    className={styles.headerButton}
                    aria-pressed={columnId === currentColumn}
                    onClick={() => handleSetCurrentColumn(columnId)}
                  >
                    {columnName}
                  </button>
                ) : (
                  columnName
                )}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {getRows().map((row, index) => {
          return (
            <tr key={index} className={styles.row}>
              {showRowNumbers && (
                <th scope="row" className={styles.indexCell}>
                  {index + 1}
                </th>
              )}
              {getColumns().map(columnId => {
                return (
                  <td
                    key={columnId}
                    className={getColumnCellClassName(columnId)}
                    onClick={() => handleSetCurrentColumn(columnId)}
                  >
                    {startingRow !== undefined && index <= startingRow ? (
                      <span>&nbsp;</span>
                    ) : (
                      getLocalizedValue(row[columnId], datasetId)
                    )}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default DataTable;
