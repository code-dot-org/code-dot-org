/* React component to handle displaying imported data. */
import {Typography} from '@mui/material';
import classNames from 'classnames';
import React, {useEffect, useRef} from 'react';

import {DATA_TABLE_ROW_LIMIT} from '../constants';
import {
  getColumnRole,
  getLocalizedColumnName,
  withIdColumnFirst,
} from '../helpers/columnDetails';
import {getLocalizedValue} from '../helpers/valueDetails';
import {deepEqual, useAppDispatch, useAppSelector} from '../hooks';
import {useProject} from '../ProjectContext';
import {getShowColumnClicking, getTableData, setCurrentColumn} from '../redux';
import {getIdColumn} from '../selectors';
import type {DatasetTableView} from '../types';

import ColumnHeader from './ColumnHeader';
import RowNumberCell from './RowNumberCell';

import styles from './dataTable.module.scss';

interface DataTableProps {
  reducedColumns?: boolean;
  singleRow?: number;
  startingRow?: number;
  noLabel?: boolean;
  hideLabel?: boolean;
  useResultsData?: boolean;
  maxRows?: number;
  view?: DatasetTableView;
}

const DataTable = ({
  reducedColumns,
  singleRow,
  startingRow,
  noLabel,
  hideLabel,
  useResultsData,
  maxRows = DATA_TABLE_ROW_LIMIT,
  view,
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
  const idColumn = useAppSelector(getIdColumn);
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

  const isSelected = (key: string) => !reducedColumns && key === currentColumn;

  const getColumnHeaderClassName = (key: string) => {
    const role = getColumnRole(project, key);
    return classNames(styles.header, {
      [styles.headerLabel]: role === 'label',
      [styles.headerFeature]: role === 'feature',
      [styles.headerSelected]: isSelected(key),
      [styles.idHeader]: key === idColumn,
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

    return classNames(
      'uitest-data-table-column',
      key === idColumn ? [styles.indexCell, styles.idCell] : styles.bodyCell,
      variant,
      {[styles.clickable]: isClickable}
    );
  };

  const getColumns = () => {
    if (view) {
      return view.columns;
    }
    if (data.length === 0) {
      return [];
    }

    const columns = Object.keys(data[0]);
    if (reducedColumns) {
      const selected = columns.filter(key => selectedFeatures.includes(key));
      return noLabel ? selected : [...selected, labelColumn];
    }
    return withIdColumnFirst(columns, idColumn);
  };

  const getRows = () => {
    if (view) {
      return view.rows.slice(0, maxRows);
    }
    if (singleRow !== undefined) {
      return [Math.min(singleRow, data.length - 1)];
    }
    return data.slice(0, maxRows).map((_row, index) => index);
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
              className={classNames(styles.indexCell, styles.indexHeader, {
                [styles.frozenIndex]: idColumn,
              })}
              aria-label="Row"
            />
          )}
          {getColumns().map(columnId => {
            const columnName = getLocalizedColumnName(datasetId, columnId);
            return (
              <ColumnHeader
                key={columnId}
                column={columnId}
                name={columnName}
                view={view}
                selected={isSelected(columnId)}
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
              </ColumnHeader>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {getRows().map((row, index) => {
          return (
            <tr key={row} className={styles.row}>
              {showRowNumbers && (
                <RowNumberCell
                  rowNumber={row + 1}
                  besideIdColumn={!!idColumn}
                />
              )}
              {getColumns().map(columnId => {
                const isIdColumn = columnId === idColumn;
                const Cell = isIdColumn ? 'th' : 'td';
                return (
                  <Cell
                    key={columnId}
                    scope={isIdColumn ? 'row' : undefined}
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
                        : getLocalizedValue(data[row][columnId], datasetId)}
                    </Typography>
                  </Cell>
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
