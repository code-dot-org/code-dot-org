/* React component to handle displaying imported data. */
import {styles} from '../constants';
import {useAppSelector} from '../hooks';
import I18n from '../i18n';

import DataTable from './DataTable';
import Statement from './Statement';

interface DataDisplayProps {
  showStatement?: boolean;
}

const DataDisplay = ({showStatement = true}: DataDisplayProps) => {
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
    <div id="data-display" style={styles.panel}>
      {showStatement && <Statement />}
      <div style={styles.tableParent}>
        <DataTable />
      </div>
      <div style={styles.footerText}>{rowCountMessage}</div>
    </div>
  );
};

export default DataDisplay;
