/**
 * @overview Component containing UI controls for modifying the table, including
 * import, export, adding a new column, and deleting the entire table.
 */

import Radium from 'radium';
import React from 'react';
import applabMsg from '@cdo/applab/locale';

import * as dataStyles from './dataStyles';

const styles = {
  buttonWrapper: {
    display: 'inline-block',
    marginBottom: 10,
    marginTop: 10,
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
    textAlign: 'justify',
},
  clearButton: [dataStyles.redButton, {
    width: 103,
  }],
  exportButton: [dataStyles.whiteButton, {
    marginLeft: 10,
    width: 120
  }],
  importButton: [dataStyles.whiteButton, {
    marginLeft: 10,
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
        <div style={styles.tableNameWrapper}>
          <span style={styles.tableName}>
            {this.props.tableName}
          </span>
        </div>
        {" "}
        <div style={styles.buttonWrapper} id="myButtonWrapper">
          <button onClick={this.props.clearTable} style={styles.clearButton}>
            Clear table
          </button>

          <span>
            <input
              ref={input => this.importFileInput = input}
              type="file"
              style={{display: 'none'}}
              accept="csv"
              onChange={this.handleSelectImportFile}
            />
            <button onClick={() => this.importFileInput.click()} style={styles.importButton}>
              Import csv
            </button>
          </span>

          <button onClick={this.props.exportCsv} style={styles.exportButton}>
            Export to csv
          </button>
        </div>

        {/* help make the "text-align: justify;" trick work */}
        <div id="myClearFix" style={dataStyles.clearfix}/>
      </div>
    );
  }
});
export default Radium(TableControls);
