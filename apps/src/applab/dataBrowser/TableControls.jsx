/**
 * @overview Component containing UI controls for modifying the table, including
 * import, export, adding a new column, and deleting the entire table.
 */

import Radium from 'radium';
import React from 'react';
import applabMsg from '../locale';

import * as dataStyles from './dataStyles';

const styles = {
  container: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 0,
    paddingRight: 0,
  },
  clearButton: [dataStyles.rightButton, {
    width: 103,
  }],
  exportButton: [dataStyles.rightButton, {
    width: 120
  }],
};

const TableControls = React.createClass({
  propTypes: {
    addColumn: React.PropTypes.func.isRequired,
    clearTable: React.PropTypes.func.isRequired,
    exportCsv: React.PropTypes.func.isRequired,
    importCsv: React.PropTypes.func.isRequired,
  },

  handleSelectImportFile() {
    if (!this.importFileInput.value) {
      return;
    }
    if (confirm(applabMsg.confirmImportOverwrite())) {
      const file = this.importFileInput.files[0];
      const reader = new FileReader();
      reader.onload = e => {
        this.props.importCsv(e.target.result);
        // Make sure we get another change event if the same file is selected again.
        this.importFileInput.value = "";
      };
      reader.readAsText(file);
    }
  },

  render() {
    return (
      <div style={styles.container}>
        <button className="btn" onClick={this.props.addColumn} style={dataStyles.button}>
          Add column
        </button>

        <button
          className="btn"
          onClick={this.props.exportCsv}
          style={styles.exportButton}
        >
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
            style={dataStyles.rightButton}
          >
            Import csv
          </button>
        </span>

        <button
          className="btn btn-danger"
          onClick={this.props.clearTable}
          style={styles.clearButton}
        >
          Clear table
        </button>

        <div style={{clear: 'both'}}/>
      </div>
    );
  }
});
export default Radium(TableControls);
