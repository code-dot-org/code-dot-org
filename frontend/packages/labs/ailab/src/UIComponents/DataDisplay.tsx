/* React component to handle displaying imported data. */
import {connect} from 'react-redux';
import {RootState} from '../redux';
import Statement from './Statement';
import DataTable from './DataTable';
import {styles} from '../constants';
import I18n from '../i18n';
import {DataRow} from '../types';

interface DataDisplayProps {
  data: DataRow[];
}

const DataDisplay = ({data}: DataDisplayProps) => {
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
      <Statement />
      <div style={styles.tableParent}>
        <DataTable />
      </div>
      <div style={styles.footerText}>{rowCountMessage}</div>
    </div>
  );
};

export default connect((state: RootState) => ({
  data: state.data,
}))(DataDisplay);
