/* React component to handle displaying imported data. */
import {Typography} from '@mui/material';
import classNames from 'classnames';
import React, {useEffect, useRef} from 'react';

import {DATA_TABLE_ROW_LIMIT} from '../constants';
import {getColumnRole, getLocalizedColumnName} from '../helpers/columnDetails';
import {getLocalizedValue} from '../helpers/valueDetails';
import {deepEqual, useAppDispatch, useAppSelector} from '../hooks';
import {useProject} from '../ProjectContext';
import {getShowColumnClicking, getTableData, setCurrentColumn} from '../redux';

import styles from './dataTable.module.scss';

interface DataTableProps {
  reducedColumns?: boolean;
  singleRow?: number;
  startingRow?: number;
  noLabel?: boolean;
  hideLabel?: boolean;
  useResultsData?: boolean;
  maxRows?: number;
}

const DataTable = ({
  reducedColumns,
  singleRow,
  startingRow,
  noLabel,
  hideLabel,
  useResultsData,
  maxRows = DATA_TABLE_ROW_LIMIT,
}: DataTableProps) => {
  const dispatch = useAppDispatch();
  const {project} = useProject();
  const data = useAppSelector(
    state => getTableData(state, project, !!useResultsData),
    deepEqual
  );
  const datasetId = useAppSelector(state => state.metadata?.name || 'unknown');
  const labelColumn = project.labelColumn || 'unknown';
  const selectedFeatures = project.selectedFeatures;
  const currentColumn = useAppSelector(state => state.currentColumn);
  const showColumnClicking = useAppSelector(getShowColumnClicking);
  const headerButtons = useRef<Record<string, HTMLButtonElement | null>>({});
  const previousColumn = useRef(currentColumn);

  // When closing the column analysis panel, return focus to that column's header.
  useEffect(() => {
    const closedColumn = previousColumn.current;
    previousColumn.current = currentColumn;
    const focusWasLost =
      !document.activeElement || document.activeElement === document.body;
    if (closedColumn && !currentColumn && focusWasLost) {
      headerButtons.current[closedColumn]?.focus();
    }
  }, [currentColumn]);

  const showRowNumbers = !reducedColumns;
  const isClickable = !reducedColumns && showColumnClicking;

  const getColumnHeaderClassName = (key: string) => {
    const role = getColumnRole(project, key);
    return classNames(styles.header, {
      [styles.headerLabel]: role === 'label',
      [styles.headerFeature]: role === 'feature',
      [styles.headerSelected]: !reducedColumns && key === currentColumn,
      [styles.clickable]: isClickable,
    });
  };

  const getColumnCellClassName = (key: string) => {
    const role = getColumnRole(project, key);
    let variant;
    if (hideLabel && role === 'label') {
      variant = styles.bodyCellHidden;
    } else if (role === 'label') {
      variant = styles.bodyCellLabel;
    } else if (role === 'feature') {
      variant = styles.bodyCellFeature;
    }

    return classNames('uitest-data-table-column', styles.bodyCell, variant, {
      [styles.clickable]: isClickable,
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
      return data.slice(0, maxRows);
    }
  };

  const handleSetCurrentColumn = (columnId: string) => {
    if (isClickable) {
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
                {isClickable ? (
                  <button
                    ref={element => {
                      headerButtons.current[columnId] = element;
                    }}
                    type="button"
                    className={styles.headerButton}
                    aria-pressed={columnId === currentColumn}
                    onClick={() => handleSetCurrentColumn(columnId)}
                  >
                    <Typography
                      component="span"
                      variant="body4"
                      className={styles.cellText}
                    >
                      {columnName}
                    </Typography>
                  </button>
                ) : (
                  <Typography
                    component="span"
                    variant="body4"
                    className={styles.cellText}
                  >
                    {columnName}
                  </Typography>
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
                  <Typography
                    component="span"
                    variant="body4"
                    className={styles.cellText}
                  >
                    {index + 1}
                  </Typography>
                </th>
              )}
              {getColumns().map(columnId => {
                return (
                  <td
                    key={columnId}
                    className={getColumnCellClassName(columnId)}
                    onClick={() => handleSetCurrentColumn(columnId)}
                  >
                    <Typography
                      component="span"
                      variant="body4"
                      className={styles.cellText}
                    >
                      {startingRow !== undefined && index <= startingRow
                        ? ' '
                        : getLocalizedValue(row[columnId], datasetId)}
                    </Typography>
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
