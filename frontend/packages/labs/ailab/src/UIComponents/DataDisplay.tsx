/* React component to handle displaying imported data. */
import {DATA_TABLE_ROW_LIMIT} from '../constants';
import {useAppSelector} from '../hooks';

import DataTable from './DataTable';

import styles from './dataDisplay.module.scss';

const DataDisplay = () => {
  const rowCount = useAppSelector(state => state.data.length);
  const datasetName = useAppSelector(state => state.name);

  if (rowCount === 0) {
    return null;
  }

  const rowCountText = `${rowCount} ${rowCount === 1 ? 'row' : 'rows'}`;
  const rowCountMessage =
    rowCount > DATA_TABLE_ROW_LIMIT
      ? `${rowCountText} (Showing first ${DATA_TABLE_ROW_LIMIT} rows)`
      : rowCountText;

  return (
    <div id="data-display" className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.title}>{datasetName || 'Dataset'}</h2>
        <span className={styles.separator} aria-hidden="true" />
        <span className={styles.rowCount}>{rowCountMessage}</span>
      </div>
      <div className={styles.tableContainer}>
        <DataTable />
      </div>
    </div>
  );
};

export default DataDisplay;
