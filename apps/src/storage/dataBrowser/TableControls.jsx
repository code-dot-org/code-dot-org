/**
 * @overview Component containing UI controls for modifying the table, including
 * import, export, adding a new column, and deleting the entire table.
 */
import ConfirmDeleteButton from './ConfirmDeleteButton';
import ConfirmImportButton from './ConfirmImportButton';
import VisualizerModal from './dataVisualizer/VisualizerModal';
import PropTypes from 'prop-types';
import Radium from 'radium';
import React from 'react';
import msg from '@cdo/locale';
import * as dataStyles from './dataStyles';

const styles = {
  buttonWrapper: {
    display: 'inline-block',
    marginBottom: 10,
    marginTop: 10
  },
  container: {
    // subtract the height of the clearfix element
    marginBottom: -28,
    // subtract the top margin of the buttonWrapper
    marginTop: -10,
    paddingTop: 0,
    paddingBottom: 10,
    paddingLeft: 0,
    paddingRight: 0,
    // make the buttons align right usually, but align left if they
    // are forced to wrap onto the next line by a very long table name.
    textAlign: 'justify'
  },
  exportButton: [
    dataStyles.whiteButton,
    {
      marginLeft: 10,
      width: 120
    }
  ],
  tableName: {
    fontSize: 18
  },
  tableNameWrapper: {
    alignItems: 'flex-end',
    display: 'inline-flex',
    height: 30,
    marginRight: 10,
    verticalAlign: 'middle'
  }
};

class TableControls extends React.Component {
  static propTypes = {
    clearTable: PropTypes.func.isRequired,
    exportCsv: PropTypes.func.isRequired,
    importCsv: PropTypes.func.isRequired,
    tableName: PropTypes.string.isRequired,
    readOnly: PropTypes.bool.isRequired
  };

  render() {
    return (
      <div style={styles.container}>
        <div style={styles.tableNameWrapper}>
          <span style={styles.tableName}>{this.props.tableName}</span>
        </div>{' '}
        <div style={styles.buttonWrapper}>
          <VisualizerModal key={this.props.tableName} />

          {!this.props.readOnly && (
            <ConfirmDeleteButton
              body={msg.confirmClearTable()}
              buttonText="Clear table"
              containerStyle={{width: 103, marginLeft: 10}}
              buttonId="clearTableButton"
              onConfirmDelete={this.props.clearTable}
              title="Clear table"
            />
          )}

          {!this.props.readOnly && (
            <ConfirmImportButton
              importCsv={this.props.importCsv}
              containerStyle={{marginLeft: 10}}
            />
          )}

          <button
            type="button"
            onClick={this.props.exportCsv}
            style={styles.exportButton}
          >
            Export to csv
          </button>
        </div>
        {/* help make the "text-align: justify;" trick work */}
        <div style={dataStyles.clearfix} />
      </div>
    );
  }
}
export default Radium(TableControls);
