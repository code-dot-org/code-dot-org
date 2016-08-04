/**
 * @overview Component containing UI controls for modifying the table, including
 * import, export, adding a new column, and deleting the entire table.
 */

import Radium from 'radium';
import React from 'react';

import * as dataStyles from './dataStyles';

const styles = {
  container: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 0,
    paddingRight: 0,
  },
  exportButton: [dataStyles.editButton, {
    width: 120
  }],
  addButton: [dataStyles.button, {
    float: 'right',
  }],
  clearButton: [dataStyles.editButton, {
    width: 103,
  }]
};

const TableControls = React.createClass({
  propTypes: {
    addColumn: React.PropTypes.func.isRequired,
    clearTable: React.PropTypes.func.isRequired,
    exportCsv: React.PropTypes.func.isRequired,
    importCsv: React.PropTypes.func.isRequired,
  },

  handleSelectImportFile() {
    const msg = 'Importing this file will overwrite the existing data in this table. ' +
      'Are you sure you want to continue?';
    if (confirm(msg)) {
      const file = this.importFileInput.files[0];
      const reader = new FileReader();
      reader.onload = e => this.props.importCsv(e.target.result);
      reader.readAsText(file);
    }
  },

  render() {
    return (
      <div style={styles.container}>
        <button
          className="btn btn-danger"
          onClick={this.props.clearTable}
          style={styles.clearButton}
        >
          Clear table
        </button>

        <button className="btn" onClick={this.props.exportCsv} style={styles.exportButton}>
          Export to csv
        </button>

        <span>
          <input
            ref={input => this.importFileInput = input}
            type="file"
            style={{display: 'none'}}
            accept="csv"
            onChange={this.handleSelectImportFile}
          />
          <button
            className="btn"
            onClick={() => this.importFileInput.click()}
            style={dataStyles.button}
          >
            Import csv
          </button>
        </span>

        <button className="btn" onClick={this.props.addColumn} style={styles.addButton}>
          Add column
        </button>
      </div>
    );
  }
});
export default Radium(TableControls);
