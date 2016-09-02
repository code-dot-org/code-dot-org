/**
 * @overview Component for editing a data table.
 */

import TableControls from './TableControls';
import AddTableRow from './AddTableRow';
import { DataView } from '../constants';
import EditTableRow from './EditTableRow';
import ColumnHeader from './ColumnHeader';
import FirebaseStorage from '../firebaseStorage';
import FontAwesome from '../../templates/FontAwesome';
import Radium from 'radium';
import React from 'react';
import { changeView } from '../redux/data';
import * as dataStyles from './dataStyles';
import color from '../../color';
import { connect } from 'react-redux';
import applabMsg from '@cdo/applab/locale';

const MIN_TABLE_WIDTH = 600;

const styles = {
  addColumnHeader: [dataStyles.headerCell, {
    width: 19,
  }],
  container: {
    flexDirection: 'column',
    height: '100%',
    minWidth: MIN_TABLE_WIDTH,
    maxWidth: '100%',
  },
  table: {
    minWidth: MIN_TABLE_WIDTH,
  },
  tableWrapper: {
    flexGrow: 1,
    overflow: 'scroll',
  },
  plusIcon: {
    alignItems: 'center',
    borderRadius: 2,
    backgroundColor: 'white',
    color: color.teal,
    cursor: 'pointer',
    display: 'inline-flex',
    height: 18,
    justifyContent: 'center',
    width: 18,
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
      editingColumn: null,
      showDebugView: false,
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
    this.setState({
      newColumns: this.state.newColumns.filter(column => column !== columnToRemove)
    });
    FirebaseStorage.deleteColumn(
      this.props.tableName,
      columnToRemove,
      () => {},
      error => console.warn(error)
    );
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
    const newColumns = this.getColumnNames();
    FirebaseStorage.clearTable(
      this.props.tableName,
      () => this.setState({newColumns, editingColumn: null}),
      msg => console.warn(msg));
  },

  toggleDebugView() {
    const showDebugView = !this.state.showDebugView;
    this.setState({showDebugView});
  },

  getTableJson() {
    const records = [];
    // Cast Array to Object
    const tableRecords = Object.assign({}, this.props.tableRecords);
    for (const id in tableRecords) {
      records.push(JSON.parse(tableRecords[id]));
    }
    return JSON.stringify(records, null, 2);
  },

  render() {
    let columnNames = this.getColumnNames();
    let editingColumn = this.state.editingColumn;

    // Always show at least one column.
    if (columnNames.length === 1) {
      editingColumn = this.getNextColumnName();
      columnNames.push(editingColumn);
    }

    const visible = (DataView.TABLE === this.props.view);
    const containerStyle = [styles.container, {
      display: visible ? '' : 'none',
    }];
    const tableDataStyle = [styles.table, {
      display: this.state.showDebugView ? 'none' : ''
    }];
    const debugDataStyle = [dataStyles.debugData, {
      display: this.state.showDebugView ? '' : 'none',
  }];
    return (
      <div id="dataTable" style={containerStyle} className="inline-flex">
        <div style={dataStyles.viewHeader}>
          <span style={dataStyles.backLink}>
            <a
              id="tableBackToOverview"
              style={dataStyles.link}
              onClick={() => this.props.onViewChange(DataView.OVERVIEW)}
            >
              <FontAwesome icon="arrow-circle-left"/>&nbsp;Back to data
            </a>
          </span>
          <span style={dataStyles.debugLink}>
            <a
              id="tableDebugLink"
              style={dataStyles.link}
              onClick={() => this.toggleDebugView()}
            >
              {this.state.showDebugView ? 'Table view' : 'Debug view'}
            </a>
          </span>
        </div>

        <TableControls
          columns={columnNames}
          clearTable={this.clearTable}
          importCsv={this.importCsv}
          exportCsv={this.exportCsv}
          tableName={this.props.tableName}
        />

        <div style={debugDataStyle}>
          {this.getTableJson()}
        </div>

        <div style={styles.tableWrapper}>
          <table style={tableDataStyle}>
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
              <th style={styles.addColumnHeader}>
                <FontAwesome icon="plus" style={styles.plusIcon} onClick={this.addColumn}/>
              </th>
              <th style={dataStyles.headerCell}>
                Actions
              </th>
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
