/**
 * @overview Component containing UI controls for modifying the table, including
 * import, export, adding a new column, and deleting the entire table.
 */

import ConfirmDeleteButton from './ConfirmDeleteButton';
import ConfirmImportButton from './ConfirmImportButton';
import Radium from 'radium';
import React from 'react';
import applabMsg from '@cdo/applab/locale';

import * as dataStyles from './dataStyles';

const styles = {
  container: {
    paddingTop: 0,
    paddingBottom: 10,
    paddingLeft: 0,
    paddingRight: 0,
  },
  exportButton: [dataStyles.whiteButton, dataStyles.alignRight, {
    width: 120
  }],
  tableName: {
    fontSize: 18,
  },
  tableNameWrapper: {
    alignItems: 'flex-end',
    display: 'inline-flex',
    height: 30,
    marginRight: 10,
    verticalAlign: 'middle',
  },
};

const TableControls = React.createClass({
  propTypes: {
    clearTable: React.PropTypes.func.isRequired,
    exportCsv: React.PropTypes.func.isRequired,
    importCsv: React.PropTypes.func.isRequired,
    tableName: React.PropTypes.string.isRequired,
  },

  render() {
    return (
      <div style={styles.container}>
        <span style={styles.tableNameWrapper}>
          <span style={styles.tableName}>
            {this.props.tableName}
          </span>
        </span>

        <button
          onClick={this.props.exportCsv}
          style={styles.exportButton}
        >
          Export to csv
        </button>

        <ConfirmImportButton importCsv={this.props.importCsv}/>

        <ConfirmDeleteButton
          body={applabMsg.confirmClearTable()}
          buttonText="Clear table"
          containerStyle={{float: 'right', width: 103}}
          onConfirm={this.props.clearTable}
          title="Clear table"
        />

        <div style={{clear: 'both'}}/>
      </div>
    );
  }
});
export default Radium(TableControls);
