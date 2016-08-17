/**
 * @overview Component for editing a data table.
 */

import TableControls from './TableControls';
import AddTableRow from './AddTableRow';
import { DataView } from '../constants';
import EditTableRow from './EditTableRow';
import ColumnHeader from './ColumnHeader';
import FirebaseStorage from '../firebaseStorage';
import Radium from 'radium';
import React from 'react';
import { changeView } from '../redux/data';
import * as dataStyles from './dataStyles';
import { connect } from 'react-redux';
import applabMsg from '../locale';

const MAX_TABLE_WIDTH = 970;

const styles = {
  table: {
    clear: 'both',
    width: '100%'
  }
};

const DataTable = React.createClass({
  propTypes: {
    // from redux state
    tableName: React.PropTypes.string.isRequired,
    // "if all of the keys are integers, and more than half of the keys between 0 and
    // the maximum key in the object have non-empty values, then Firebase will render
    // it as an array."
    // https://firebase.googleblog.com/2014/04/best-practices-arrays-in-firebase.html
    tableRecords: React.PropTypes.oneOfType([
      React.PropTypes.object,
      React.PropTypes.array
    ]).isRequired,
    view: React.PropTypes.oneOf(Object.keys(DataView)),

    // from redux dispatch
    onViewChange: React.PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      newColumns: [],
      editingColumn: null
    };
  },

  componentWillReceiveProps(nextProps) {
    // Forget about new columns or editing columns when switching between tables.
    if (this.props.tableName !== nextProps.tableName) {
      this.setState(this.getInitialState());
    }
  },

  addColumn() {
    const columnName = this.getNextColumnName();
    this.setState({
      newColumns: this.state.newColumns.concat(columnName),
      editingColumn: columnName,
    });
  },

  deleteColumn(columnToRemove) {
    if (confirm('Are you sure you want to delete this entire column? You cannot undo this action.')) {
      this.setState({
        newColumns: this.state.newColumns.filter(column => column !== columnToRemove)
      });
      FirebaseStorage.deleteColumn(
        this.props.tableName,
        columnToRemove,
        () => {},
        error => console.warn(error)
      );
    }
  },

  /**
   * @param {string|null} columnName Column to edit, or null to not edit any column.
   */
  editColumn(columnName) {
    this.setState({editingColumn: columnName});
  },

  renameColumn(oldName, newName) {
    let newColumns = this.state.newColumns.map(
      curName => (curName === oldName ? newName : curName)
    );
    // Append the new name if the old name was not found.
    if (newColumns.indexOf(newName) === -1) {
      newColumns.push(newName);
    }
    this.setState({
      newColumns,
      editingColumn: null
    });
    if (oldName !== newName) {
      FirebaseStorage.renameColumn(
        this.props.tableName,
        oldName,
        newName,
        () => {},
        error => console.warn(error)
      );
    }
  },

  getColumnNames() {
    // Make sure 'id' is the first column.
    let columnNames = ['id'];

    Object.keys(this.props.tableRecords).forEach(id => {
      const record = JSON.parse(this.props.tableRecords[id]);
      Object.keys(record).forEach(columnName => {
        if (columnNames.indexOf(columnName) === -1) {
          columnNames.push(columnName);
        }
      });
    });

    this.state.newColumns.forEach(columnName => {
      if (columnNames.indexOf(columnName) === -1) {
        columnNames.push(columnName);
      }
    });

    return columnNames;
  },

  getNextColumnName() {
    const names = this.getColumnNames();
    let i = names.length;
    while (names.includes(`column${i}`)) {
      i++;
    }
    return `column${i}`;
  },

  importCsv(csvData) {
    FirebaseStorage.importCsv(
      this.props.tableName,
      csvData,
      () => this.setState(this.getInitialState()),
      msg => console.warn(msg));
  },

  exportCsv() {
    const tableName = encodeURIComponent(this.props.tableName);
    location.href = `/v3/export-firebase-tables/${Applab.channelId}/${tableName}`;
  },

  /** Delete all rows, but preserve the columns. */
  clearTable() {
    if (confirm(applabMsg.confirmClearTable())) {
      const newColumns = this.getColumnNames();
      FirebaseStorage.deleteTable(
        this.props.tableName,
        () => this.setState({newColumns, editingColumn: null}),
        msg => console.warn(msg));
    }
  },

  render() {
    let columnNames = this.getColumnNames();
    let editingColumn = this.state.editingColumn;

    // Always show at least one column for empty tables.
    if (Object.keys(this.props.tableRecords).length === 0 && columnNames.length === 1) {
      editingColumn = this.getNextColumnName();
      columnNames.push(editingColumn);
    }

    const visible = (DataView.TABLE === this.props.view);
    const containerStyle = {
      display: visible ? 'block' : 'none',
      maxWidth: MAX_TABLE_WIDTH
    };
    return (
      <div id="dataTable" style={containerStyle}>
        <h4>
          <a
            id="tableBackToOverview"
            href="#"
            style={dataStyles.link}
            onClick={() => this.props.onViewChange(DataView.OVERVIEW)}
          >
            Data
          </a>
          &nbsp;&gt; {this.props.tableName}
        </h4>

        <TableControls
          columns={columnNames}
          addColumn={this.addColumn}
          clearTable={this.clearTable}
          importCsv={this.importCsv}
          exportCsv={this.exportCsv}
        />

        <table style={styles.table}>
          <tbody>
          <tr>
            {
              columnNames.map(columnName => (
                <ColumnHeader
                  key={columnName}
                  columnName={columnName}
                  columnNames={columnNames}
                  deleteColumn={this.deleteColumn}
                  editColumn={this.editColumn}
                  isEditable={columnName !== 'id'}
                  isEditing={editingColumn === columnName}
                  renameColumn={this.renameColumn}
                />
              ))
            }
            <th style={dataStyles.headerCell}/>
          </tr>

          <AddTableRow tableName={this.props.tableName} columnNames={columnNames}/>

          {
            Object.keys(this.props.tableRecords).map(id => (
              <EditTableRow
                columnNames={columnNames}
                tableName={this.props.tableName}
                record={JSON.parse(this.props.tableRecords[id])}
                key={id}
              />
            ))
          }
          </tbody>
        </table>
      </div>
    );
  }
});

export default connect(state => ({
  view: state.data.view,
  tableRecords: state.data.tableRecords || {},
  tableName: state.data.tableName || ''
}), dispatch => ({
  onViewChange(view) {
    dispatch(changeView(view));
  }
}))(Radium(DataTable));
