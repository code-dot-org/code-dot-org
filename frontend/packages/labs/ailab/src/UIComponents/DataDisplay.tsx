/* React component to handle displaying imported data. */
import {Typography} from '@mui/material';
import {useEffect, useState} from 'react';

import SegmentedButtons from '@code-dot-org/component-library/segmentedButtons';

import {DATA_TABLE_ROW_LIMIT} from '../constants';
import {useAppDispatch, useAppSelector} from '../hooks';
import {setDatasetLayout} from '../redux';

import DatasetRowCards from './DatasetRowCards';
import DataTable from './DataTable';

import styles from './dataDisplay.module.scss';

const DataDisplay = () => {
  const dispatch = useAppDispatch();
  const rowCount = useAppSelector(state => state.data.length);
  const datasetName = useAppSelector(state => state.name);
  const datasetLayout = useAppSelector(state => state.datasetLayout);
  const [rowIndex, setRowIndex] = useState(0);

  useEffect(() => {
    setRowIndex(0);
  }, [datasetName]);

  if (rowCount === 0) {
    return null;
  }

  const rowCountText = `${rowCount} ${rowCount === 1 ? 'row' : 'rows'}`;
  const rowCountMessage =
    datasetLayout === 'table' && rowCount > DATA_TABLE_ROW_LIMIT
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
      {datasetLayout === 'cards' ? (
        <DatasetRowCards rowIndex={rowIndex} onRowIndexChange={setRowIndex} />
      ) : (
        <div className={styles.tableContainer}>
          <DataTable />
        </div>
      )}
    </div>
  );
};

export default DataDisplay;
