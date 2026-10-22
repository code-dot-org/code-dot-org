/* React component to handle displaying imported data. */
import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';
import {Typography} from '@mui/material';
import React, {useMemo} from 'react';

import {DATA_TABLE_ROW_LIMIT} from '../constants';
import {useAppDispatch, useAppSelector} from '../hooks';
import {setDatasetLayout} from '../redux';
import {useDatasetTableView} from '../useTableView';

import DatasetCardDeck from './DatasetCardDeck';
import DataTable from './DataTable';
import TableFilter from './TableFilter';

import styles from './dataDisplay.module.scss';

const DataDisplay = () => {
  const dispatch = useAppDispatch();
  const data = useAppSelector(state => state.data);
  const datasetName = useAppSelector(state => state.name);
  const datasetLayout = useAppSelector(state => state.datasetLayout);
  const rows = useMemo(() => [...data.keys()], [data]);
  const columns = useMemo(() => Object.keys(data[0] ?? {}), [data]);
  const tableView = useDatasetTableView(rows, columns);

  const rowCount = data.length;
  if (rowCount === 0) {
    return null;
  }

  const isTable = datasetLayout === 'table';
  const shownCount = isTable ? tableView.rows.length : rowCount;
  const totalText = `${rowCount} ${rowCount === 1 ? 'row' : 'rows'}`;
  const rowCountText =
    shownCount === rowCount ? totalText : `${shownCount} of ${totalText}`;
  const rowCountMessage =
    isTable && shownCount > DATA_TABLE_ROW_LIMIT
      ? `${rowCountText} (Showing first ${DATA_TABLE_ROW_LIMIT})`
      : rowCountText;

  const onLayoutChange = (value: string) => {
    if (value === 'table' || value === 'cards') {
      dispatch(setDatasetLayout(value));
    }
  };

  return (
    <div id="data-display" className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.summary}>
          <Typography component="h3" variant="label2" className={styles.title}>
            {datasetName || 'Dataset'}
          </Typography>
          <span className={styles.separator} aria-hidden="true" />
          <Typography
            component="span"
            variant="body4"
            className={styles.rowCount}
          >
            {rowCountMessage}
          </Typography>
        </div>
        <div className={styles.actions}>
          {isTable && <TableFilter view={tableView} />}
          <div
            role="group"
            aria-label="Dataset view"
            className={styles.viewToggle}
          >
            <SegmentedButtons
              size="xs"
              selectedButtonValue={datasetLayout}
              onChange={onLayoutChange}
              buttons={[
                {
                  value: 'table',
                  label: 'Table',
                  iconLeft: {iconName: 'table', iconStyle: 'solid'},
                },
                {
                  value: 'cards',
                  label: 'Cards',
                  iconLeft: {iconName: 'cards-blank', iconStyle: 'solid'},
                },
              ]}
            />
          </div>
        </div>
      </div>
      {isTable ? (
        <div className={styles.tableContainer}>
          <DataTable view={tableView} />
        </div>
      ) : (
        <DatasetCardDeck />
      )}
    </div>
  );
};

export default DataDisplay;
