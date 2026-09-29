/* React component to handle displaying imported data. */
import {useAppSelector} from '../hooks';
import I18n from '../i18n';

import DataTable from './DataTable';
import Statement from './Statement';

import shared from '../shared.module.scss';
import styles from './dataDisplay.module.scss';

const DataDisplay = () => {
  const data = useAppSelector(state => state.data);

  if (data.length === 0) {
    return null;
  }

  const rowCount = data.length;
  const rowLimit = 100;
  const rowCountMessage =
    rowCount <= rowLimit
      ? I18n.t('dataDisplayRowCount', {rowCount: rowCount})
      : I18n.t('dataDisplayRowCountTruncated', {
          rowCount: rowCount,
          rowLimit: rowLimit,
        });
  return (
    <div id="data-display" className={shared.panel}>
      <Statement />
      <div className={shared.tableParent}>
        <DataTable />
      </div>
      <div className={styles.footer}>{rowCountMessage}</div>
    </div>
  );
};

export default DataDisplay;
