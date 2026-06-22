/* React component to handle displaying imported data. */
import {styles} from '../constants';
import {getLocalizedColumnName} from '../helpers/columnDetails';
import {getLocalizedValue} from '../helpers/valueDetails';
import {useAppDispatch, useAppSelector} from '../hooks';
import {getTableData, setCurrentColumn, setHighlightColumn} from '../redux';

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
  const data = useAppSelector(state => getTableData(state, !!useResultsData));
  const datasetId = useAppSelector(state => state.metadata?.name || 'unknown');
  const labelColumn = useAppSelector(state => state.labelColumn || 'unknown');
  const selectedFeatures = useAppSelector(state => state.selectedFeatures);
  const currentColumn = useAppSelector(state => state.currentColumn);
  const highlightColumn = useAppSelector(state => state.highlightColumn);
  const currentPanel = useAppSelector(state => state.currentPanel);

  const setCurrentColumnProp = (column: string | undefined) =>
    dispatch(setCurrentColumn(column as string));
  const setHighlightColumnProp = (column: string | undefined) =>
    dispatch(setHighlightColumn(column as string));
  const getColumnHeaderStyle = (key: string) => {
    let style;

    if (key === labelColumn) {
      style = styles.dataDisplayHeaderLabel;
    } else if (selectedFeatures.includes(key)) {
      style = styles.dataDisplayHeaderFeature;
    }

    const pointerStyle = !reducedColumns && styles.dataDisplayHeaderClickable;

    return {...styles.dataDisplayHeader, ...pointerStyle, ...style};
  };

  const getColumnCellStyle = (key: string) => {
    let style;

    if (hideLabel && labelColumn === key) {
      style = styles.dataDisplayCellHidden;
    } else if (key === currentColumn) {
      if (currentPanel === 'dataDisplayLabel') {
        style = styles.dataDisplayCellSelectedLabel;
      } else {
        style = styles.dataDisplayCellSelected;
      }
    } else if (key === highlightColumn) {
      if (currentPanel === 'dataDisplayLabel') {
        style = styles.dataDisplayCellHighlightedLabel;
      } else {
        style = styles.dataDisplayCellHighlighted;
      }
    }

    return {...styles.dataDisplayCell, ...style};
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
    if (!reducedColumns) {
      setCurrentColumnProp(columnId);
    }
  };

  const handleSetHighlightColumn = (columnId: string | undefined) => {
    if (!reducedColumns) {
      setHighlightColumnProp(columnId);
    }
  };

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <table style={styles.displayTable}>
      <thead>
        <tr>
          {getColumns().map(columnId => {
            return (
              <th
                key={columnId}
                style={getColumnHeaderStyle(columnId)}
                onClick={() => handleSetCurrentColumn(columnId)}
                onKeyDown={() => handleSetCurrentColumn(columnId)}
                onMouseEnter={() => handleSetHighlightColumn(columnId)}
                onMouseLeave={() => handleSetHighlightColumn(undefined)}
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
            <tr key={index}>
              {getColumns().map(columnId => {
                return (
                  <td
                    key={columnId}
                    className="uitest-data-table-column"
                    style={getColumnCellStyle(columnId)}
                    onClick={() => handleSetCurrentColumn(columnId)}
                    onKeyDown={() => handleSetCurrentColumn(columnId)}
                    onMouseEnter={() => handleSetHighlightColumn(columnId)}
                    onMouseLeave={() => handleSetHighlightColumn(undefined)}
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
