/* React component to handle displaying imported data. */
import type {KeyboardEvent} from 'react';

import {getLocalizedColumnName} from '../helpers/columnDetails';
import {getLocalizedValue} from '../helpers/valueDetails';
import {deepEqual, useAppDispatch, useAppSelector} from '../hooks';
import {getTableData, setCurrentColumn} from '../redux';

import moduleStyles from './dataTable.module.scss';

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

  const isClickable = !reducedColumns;
  const showRowNumbers = !reducedColumns;

  const getColumnHeaderClassName = (key: string) => {
    const classNames = [moduleStyles.header];
    if (key === labelColumn) {
      classNames.push(moduleStyles.headerLabel);
    } else if (selectedFeatures.includes(key)) {
      classNames.push(moduleStyles.headerFeature);
    }
    if (isClickable && key === currentColumn) {
      classNames.push(moduleStyles.headerSelected);
    }
    if (isClickable) {
      classNames.push(moduleStyles.clickable);
    }
    return classNames.join(' ');
  };

  const getColumnCellClassName = (key: string) => {
    const classNames = ['uitest-data-table-column', moduleStyles.bodyCell];
    if (hideLabel && key === labelColumn) {
      classNames.push(moduleStyles.bodyCellHidden);
    } else if (key === labelColumn) {
      classNames.push(moduleStyles.bodyCellLabel);
    } else if (selectedFeatures.includes(key)) {
      classNames.push(moduleStyles.bodyCellFeature);
    }
    if (isClickable) {
      classNames.push(moduleStyles.clickable);
    }
    return classNames.join(' ');
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
    if (isClickable) {
      dispatch(setCurrentColumn(columnId));
    }
  };

  const handleHeaderKeyDown = (
    event: KeyboardEvent<HTMLTableCellElement>,
    columnId: string,
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSetCurrentColumn(columnId);
    }
  };

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <table className={moduleStyles.table}>
      <thead>
        <tr>
          {showRowNumbers && (
            <th
              className={`${moduleStyles.indexCell} ${moduleStyles.indexHeader}`}
              aria-label="Row"
            />
          )}
          {getColumns().map(columnId => {
            return (
              <th
                key={columnId}
                className={getColumnHeaderClassName(columnId)}
                tabIndex={isClickable ? 0 : undefined}
                aria-selected={
                  isClickable ? columnId === currentColumn : undefined
                }
                onClick={() => handleSetCurrentColumn(columnId)}
                onKeyDown={event => handleHeaderKeyDown(event, columnId)}
              >
                {getLocalizedColumnName(datasetId, columnId)}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {getRows().map((row, index) => {
          return (
            <tr key={index} className={moduleStyles.row}>
              {showRowNumbers && (
                <th scope="row" className={moduleStyles.indexCell}>
                  {index + 1}
                </th>
              )}
              {getColumns().map(columnId => {
                return (
                  <td
                    key={columnId}
                    className={getColumnCellClassName(columnId)}
                    onClick={() => handleSetCurrentColumn(columnId)}
                    role="gridcell"
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
